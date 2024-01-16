import express from "express";
import mysql from "mysql";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import multer from 'multer';
import path from "path";

const app = express();

app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET"],
    credentials: true
}));


app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: (req, file, db) => {
        db(null, 'public/images')
    },
    filename: (req, file, db) => {
        db(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage
})

app.post('/upload', upload.single('image') ,(req,res) => {
    // console.log(req.file);
    const image = req.file.filename;
    const sql = "UPDATE userprofile SET image = ?";
    db.query(sql, [image], (err,result) => {
        if(err){
            return res.json({Message: "Error in image uploading"});
        }
        else{
            return res.json({Status: "Success"});
        }
    })
})

//TO CREATE THE SESSION 
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

//TO CONNECT THE DATABSE
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root123",
    database: "logindb"
})

//FUNCTION TO VERIFY THE USER AND PASS NAME,EMAIL AND ID 
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

//DATABASE CONNECTION
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
    const email_patt = /^[a-zA-Z0-9]+@[^\s@]+\.[^\s@]+$/;
    const sql = "INSERT INTO users (`name`, `email`, `password`) VALUES (?,?,?)";
    const values = [
        req.body.name,
        req.body.email,
        req.body.password
    ];
    console.log(values);
    // console.log(req.body.email);
    const sqlnew = "INSERT INTO userprofile (`name`, `email`, `user_id`) VALUES (?,?,?)";
    const Duplicate = 'SELECT * FROM users WHERE email = ?';
    if (!email_patt.test(req.body.email)) {
        console.log(req.body.email)
        return res.json("Oops sorry!! Wrong email input");
    }
    else {
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
    }
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

//TO MAINTAIN LOGOUT SESSIONS
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ Status: "Success" })
})

//TO SEND DATA FROM FORM TO TABLE 
app.post('/userprofile',verifyUser, upload.single('image') ,(req, res) => {
    // console.log(req.file)
    const data = JSON.parse(req.body.values);
    const sql = "UPDATE userprofile SET name = ?, email = ? , age = ?, gender = ?, mobilenumber = ?, address = ?, pincode = ?, city = ?, state = ?, country = ?, image =? WHERE user_id = ?";
    const values = [
        data.name,
        data.email,
        data.age,
        data.gender,
        data.mobilenumber,
        data.address,
        data.pincode,
        data.city,
        data.state,
        data.country,
        req.file && req.file.filename ? req.file.filename : "", 
        req.id
    ];
    // console.log(data.name);
    // console.log(req.body);
    db.query(sql, values, (err, data) => {
        if (err) {
            console.log(err);
            return res.json("Error - Check the age field and try again. The age field cannot be a string.");
        }
        else {
            const data = JSON.parse(req.body.values);
            const sql_new = "UPDATE users SET name = ?, email = ? WHERE id=?";
            const value_new = [
                data.name,
                data.email,  
                req.id,
            ];
            // console.log(value_new);
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

//TO UPDATE USER'S DETAILS IN THE FORM
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
            // console.log(data);
            return res.json({ Status: "Update True", data: data[0] });
        }
    })
})

//TO CONNECT TO BACKEND SERVER
app.listen(8081, () => {
    console.log("Listening");
})
