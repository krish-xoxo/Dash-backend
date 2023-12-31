import express from "express";
import mysql from "mysql";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
// import test from "./test";

const app = express();
// const [errors, setErrors] = useState({})

app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET"],
    credentials: true
}));


app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}))
//const salt = 10;

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root123",
    database: "logindb"
})

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ Message: "No token found. Please login to create a token" })
    } else {
        jwt.verify(token, "mera-jsonwebtoken-private-key", (err, decoded) => {
            if (err) {
                console.log(err);
                return res.json({ Message: "Error" })
            } else {
                req.name = decoded.name;
                req.email = decoded.email;
                req.id = decoded.id;
                next();
            }
        })
    }
}

db.connect(function (err) {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Connected");
    }
})

//TO VALIDATE USING WEBTOKENS
app.get('/', verifyUser, (req, res) => {
    return res.json({ Status: "Success", name: req.name, email: req.email })
})

//TO ENTER NORMAL PASSWORD(WITHOUT HASHED)[VALIDATED]:
app.post('/signup', (req, res) => {
    const email_patt = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sql = "INSERT INTO users (`name`, `email`, `password`) VALUES (?,?,?)";
    const values = [
        req.body.name,
        req.body.email,
        req.body.password
    ];
    //console.log(values);
    const sqlnew = "INSERT INTO userprofile (`name`, `email`, `user_id`) VALUES (?,?,?)";
    const Duplicate = 'SELECT * FROM users WHERE email = ?';
    db.query(Duplicate, [values.email], (duplicateErr, duplicateData) => {
        if (duplicateErr) {
            console.log(duplicateErr);
            console.log(res.json);
            return res.json("Error");
        }
        else if (duplicateData && duplicateData.length > 0) {
            return res.status("Account already created");
        }
        else {
            db.query(sql, values, (err, data) => {
                if (err) {
                    console.log(err);
                    return res.json("Error - Email already exists");
                }
                //console.log(data);
                const value_new = [
                    req.body.name,
                    req.body.email,
                    data.insertId
                ];
                db.query(sqlnew, value_new, (e, data) => {
                    if (e) {
                        console.log(e);
                    }
                    else {
                        //console.log(data);
                    }
                })
                return res.json(data);
            })
        }
    })
})

//TO LOGIN USING NORMAL PASSWORD: 
app.post('/login', (req, res) => {
    const email_patt = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sql = 'SELECT * FROM users WHERE `email` = ? && `password`=?';
    const values = [req.body.email];
    db.query(sql, [req.body.email, req.body.password], (err, data) => {
        if (!email_patt.test(values.email)) {
            if (err) {
                console.log(err);
                return res.json("Error");
            }
            else if (data.length > 0) {
                //console.log(req.body.password);
                const name = data[0].name;
                const email = data[0].email;
                const id = data[0].id;
                const token = jwt.sign({ name, email, id }, "mera-jsonwebtoken-private-key", { expiresIn: '1d' });
                res.cookie('token', token);
                //console.log(data);
                return res.json({ Status: "Success" })
            }
            return res.json({ Status: "Error - No record found" })
        }
        else {
            console.log(res.json);
            return res.json("Fail");
        }
    })
})

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ Status: "Success" })
})

app.post('/userprofile', verifyUser, (req, res) => {
    // const err = test(values);
    // setErrors(err);
    // if (err.mobilenumber === "" && err.pincode === "" && err.city === "" && err.state === "" && err.country === "") {
        const sql = "UPDATE userprofile SET name = ?, email = ? , age = ?, gender = ?, mobilenumber = ?, address = ?, pincode = ?, city = ?, state = ?, country = ? WHERE user_id = ?";
        const values = [
            req.body.name,
            req.body.email,
            req.body.age,
            req.body.gender,
            req.body.mobilenumber,
            req.body.address,
            req.body.pincode,
            req.body.city,
            req.body.state,
            req.body.country,
            req.id,
        ];
        console.log(values);
        db.query(sql, values, (err, data) => {
            if (err) {
                console.log(err);
                return res.json("Error - Check the age field and try again. The age field cannot be a string.");
            }
            else {
                const sql_new = "UPDATE users SET name = ?, email = ? WHERE id=?";
                const value_new = [
                    req.body.name,
                    req.body.email,
                    req.id,
                ];
                db.query(sql_new, value_new, (e, data) => {
                    if (e) {
                        console.log(e);
                        return res.json("Failed - The email and password field cannot be empty.");
                    }
                    else {
                        //console.log(data);
                        return res.json(data);
                    }
                })
            }
        })
    // }
});


app.get('/userdetails', verifyUser, (req, res) => {
    const sql = "SELECT * FROM userprofile WHERE user_id = ?";
    const values = [
        req.id,
    ];
    db.query(sql, values, (err, data) => {
        if (err) {
            console.log(err);
            return res.json("Error");
        }
        else {
            //console.log(data);
            return res.json({ Status: "Update True", data: data[0] });
        }
    })
})

app.listen(8081, () => {
    console.log("Listening");
})
