function test() {
    let error = {};
    console.log("Hie");
    const data = {
        "id": 2,
        "name": "Krish Joshi",
        "email": "krish@xoxoday.com",
        "age": "23",
        "gender": "male",
        "mobilenumber": "0000000000",
        "address": "BTM 2nd stage",
        "pincode": "krish",
        "city": "Bengaluru",
        "state": "Karnataka",
        "country": "India"
    }
    const numPattern = /^\d{1,13}$/;
    const pinPattern = /^\d{1,6}$/;
    const namePattern = /^[A-Za-z\s]+$/;

    if (!numPattern.test(data.mobilenumber)){
        error.mobilenumber = "Please check the mobile number field. The field cannot be a string";
    }
    else{
        error.mobilenumber = "";
    }
    if (!pinPattern.test(data.pincode)){
        error.pincode = "Please check the pincode field. The field cannot be a string";
    }
    else{
        error.pincode = "";
    }
    if (!namePattern.test(data.city)){
        error.city = "Please check the city field. The field cannot be an integer";
    }
    else{
        error.city = "";
    }
    if (!namePattern.test(data.state)){
        error.state = "Please check the state field. The field cannot be an integer";
    }
    else{
        error.state = "";
    }
    if (!namePattern.test(data.country)){
        error.country = "Please check the country field. The field cannot be an integer";
    }
    else{
        error.country = "";
    }
    return error;
}

export default test










