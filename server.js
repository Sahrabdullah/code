const express = require('express')
const server = express()
const db_access = require('./db.js')
const db = db_access.db
const port = 127
server.use(express.json()) //instead of using body parser

//USER
//REGISTERATION
server.post(`/user/register`, (req, res) => { //req body
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const user_role = req.body.user_role
    const content = `INSERT INTO USERS (NAME,EMAIL,PASSWORD,USER_ROLE, ISADMIN) 
                VALUES ('${name}', '${email}','${password}', '${user_role}',0)`
    db.run(content, (err) => {
        if (err) {
            console.log(err.message)
            return res.status(401).send(`Registration Failed`)     //401 is unauthorized user
        }
        else
            return res.status(200).send(`Registered Successfully`)      //20 is OK
    })
})


//LOGIN
server.post(`/user/login`, (req, res) => { //req body
    // const name = req.body.name
    const email = req.body.email
    const password = req.body.password

    db.get(`SELECT * FROM USERS WHERE EMAIL= '${email}' AND PASSWORD = '${password}' `, (err, row) => {
        if (err || !row)
            return res.status(401).send(`Fail to Login`) //401 is unauthorized user
        else
            return res.status(201).send(`Login Successfull`)  //201 is created
    })
})
