# question-bank-api

## File Structure
question-bank-api/
│
├── node_modules/
├── package-lock.json
├── README.md
|
├── views/
|  └── layout
|    └── base.ejs
|  └── questions
|     └── bank.ejs
|     └── search.ejs
|     └── add.ejs
|     └── edit.ejs
|     └── delete.ejs
|  └── user
|     └── edit.ejs
|  └── auth
|     └── login.ejs
|     └── register.ejs
|  └── navbar.js
|
| styles.css
|
|
├── config/
│ └── db.js # MongoDB connection setup
│
├── controllers/ #DB Queries
│ ├── authController.js 
│ └── questionController.js 
│
├── middleware/ # Request interceptors
│ ├── auth.js # CORS configuration, JWT/Auth verification
│ └── validate.js # Input validation before hitting the DB
│
├── routes/ # Endpoint mapping (HTTP methods defined here)
│ ├── authRoutes.js # /api/auth paths
│ └── questionRoutes.js # /api/questions paths
│
│
├── .env # Environment variables (DB URI, Ports)
├── package.json # Dependencies
└── server.js # Entry point (Express server instantiation)

