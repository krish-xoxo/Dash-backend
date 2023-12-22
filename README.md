# Getting Started with Backend
Welcome to the backend repository of the User Authentication and Profile Management System. This repository contains the server-side code implemented in Node.js using Express for handling user authentication, registration, and profile management.

## Table of Contents
### Overview
### Technology Stack
### Getting Started
### API Endpoints
### Token Validation
### Signup
### Login
### Logout
### Update User Profile
### Database Connection
### Running the Server
### Contributing
### License

### Overview
The backend of the User Authentication and Profile Management System is built using Express, a web application framework for Node.js. It incorporates MySQL as the database for storing user information securely. The system supports user registration, login, logout, and profile management functionalities, ensuring a seamless and secure experience for users.

### Technology Stack
#### Express: Web application framework for Node.js.
#### MySQL: Open-source relational database management system.
#### Cors: Middleware for handling Cross-Origin Resource Sharing.
#### Express-session: Middleware for managing user sessions.
#### Cookie-parser: Middleware for parsing cookies.
#### Body-parser: Middleware for parsing request bodies.
#### Jsonwebtoken: Library for creating and verifying JSON Web Tokens.

### Getting Started
Clone the repository:

bash
Copy code
git clone https://github.com/krish-xoxo/Dash-backend.git
### Install dependencies:

bash
Copy code
npm install
Configure your MySQL database credentials in the db constant within index.js.

### API Endpoints
The backend provides the following API endpoints:

### Token Validation
GET /: Validates the user's token and returns user information.
### Signup
POST /signup: Registers a new user with a name, email, and password. Validates email existence and inserts data into the database.
### Login
POST /login: Authenticates a user with email and password, generating a token upon successful login.
### Logout
GET /logout: Clears the user's token, logging them out.
### Update User Profile
POST /userprofile: Updates user details, including name, email, age, gender, mobile number, address, pincode, city, state, and country.
### Database Connection
The database connection is established using the mysql package. Database credentials can be configured in the db constant within the index.js file.

### Running the Server
Start the server by running the following command:

bash
Copy code
npm start
The server will be accessible at http://localhost:8081.

### Contributing
Contributions are welcome! If you have ideas for enhancements or find any issues, feel free to open an issue or submit a pull request.

### License
This project is licensed under the MIT License - see the LICENSE file for details.
