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

//GET ALL USERS
// ---- ADMIN
server.get(`/users`, (req, res) => { //req body
    const car = `SELECT * FROM USERS`
    db.all(car, (err, rows) => {
        if (err) {
            console.log(err)
            return res.send(err)
        }
        else
            return res.send(rows)
    })
})

//DELETE USER
server.delete(`/user/delete/:id`,(req,res)=>{
     const user = `DELETE FROM USERS WHERE ID = ${req.params.id}`
     db.run(user, (err) => {
server.delete(`/user/delete/:id`, (req, res) => {
    const user = `DELETE FROM USERS WHERE ID = ${req.params.id}`
    db.run(user, (err) => {
        if (err) {
            console.log(err)
            return res.send(err)
        }
        else if (!row) {
            return res.send(`This id ${req.params.id} is not found`)
        }
        else {
            return res.send(`The user with the id ${req.params.id} is deleted`)
        }
    })
})


// CARS
//ADD CARS
server.post(`/cars/addcars`, (req, res) => {
    const brand = req.body.brand
    const model = req.body.model
    const km = req.body.km
    const price = req.body.price
    const email = req.body.email
    let cars = `INSERT INTO CARS (BRAND,MODEL,KM,PRICE,EMAIL)
        VALUES('${brand}','${model}','${km}',${price},'${email}') `
    db.run(cars, (err) => {
        if (err) {
            console.log(err)
            return res.send(err)
        }
        else
            return res.send(`car added successfully`)
    })
})

//GET ALL CARS
server.get(`/cars`, (req, res) => { //req body
    const car = `SELECT * FROM CARS`
    db.all(car, (err, rows) => {
        if (err) {
            console.log(err)
            return res.send(err)
        }
        else
            return res.send(rows)
    })
})

//SEARCH CAR BY ID 
//ROUTE PARAMS
server.get(`/cars/:id`, (req, res) => { //route params
    const car = `SELECT * FROM CARS WHERE ID =${req.params.id}`
    db.get(car, (err, rows) => {
        if (err) { //send the error
            console.log(err)
            return res.send(err)
        }
        else if (!rows) {  //not found id
            return res.status(404).send(`THE CAR WITH ID ${req.params.id} IS NOT FOUND`) //404 not found
        }
        else //successful 
            return res.send(rows)
    })
})

//EDIT CAR
// -- ADMIN
server.put(`/cars/edit/:id`, (req, res) => {
    const brand = req.body.brand
    const model = req.body.model
    const price = req.body.price
    const km = req.body.km

    const query = `UPDATE CARS SET BRAND= '${brand}',MODEL= '${model}',PRICE= ${price},KM= '${km}' WHERE ID= ${req.params.id}`
    db.run(query, (err) => {
        if (err) {
            console.log(err)
            return res.send(err)
        }
        else if (!row) {
        else
            return res.send(`Car with the id ${req.params.id} is updated successfully`)
    })
})


// SEARCH CAR BY FEATURES
// QUERY PARAMS
server.get(`/car`, (req, res) => {
        let brand = req.query.brand;
        let model = req.query.model;
        let price = req.query.price;
        let km = req.query.km;
    
        let query = `SELECT * FROM CARS WHERE 1=1`; // Base query to append conditions
    
        if (brand) 
            query += ` AND BRAND = '${brand}'`;
        
        if (model) 
            query += ` AND MODEL = '${model}'`;
        
        if (price) 
            query += ` AND PRICE = ${price}`;
        
        if (km) 
            query += ` AND KM = ${km}`;
    
        db.all(query, (err, rows) => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            }
            else {
                return res.json(rows); // Return filtered cars
            }
        });
    });



//DELETE CARS
//ROUTE PARAMS
//-- ADMIN
server.delete(`/cars/deletecar/:id`,verifyToken, (req, res) => {
    const ISADMIN = req.userDetails.isAdmin;
    if (ISADMIN !== 1)
        return res.status(403).send("you are not an admin")
    const car = `DELETE FROM CARS WHERE ID = ${req.params.id}`
    db.run(car, (err,row) => {
        if (err) {
            console.log(err)
            return res.send(err)
        }
        if (!row) {
            return res.send(`This id ${req.params.id} is not found`)
        }
        else
            return res.send(`Car with the id ${req.params.id} is deleted`)
    })
})


// REVIEW
// ADD REVIEW
server.post(`/addreview`, (req, res) => {
    const user_id = req.body.user_id
    const review = req.body.review

    const reviews = `INSERT INTO REVIEWS (USER_ID,REVIEW) VALUES (${user_id}, '${review}')`
    db.run(reviews, (err) => {
        if (err) {
            console.log(err)
            return res.send(err)
        }
        else
            return res.send(`Thank You For Your Review`)
    })
})

//GET ALL reviews
// -- ADMIN
server.get(`/reviews`, (req, res) => { //req body
        // return res.status(403).send("you are not an admin")
    const review = `SELECT * FROM REVIEWS`
    db.all(review, (err, rows) => {
        if (err) {
            console.log(err)
            return res.send(err)
        }
        else
            return res.send(rows)
    })
})

//DELETE REVIEW
// -- ADMIN
server.delete(`/deletereview/:id`, (req, res) => {
    const car = `DELETE FROM REVIEWS WHERE ID = ${req.params.id}`
    db.run(car, (err) => {
        if (err) {
            console.log(err)
            return res.send(err)
        }
        else
            return res.send(`Review with the id ${req.params.id} is deleted`)
    })
})

//BOOKING
//BOOKING TEST DRIVE
server.post(`/book`, ((req, res) => {
    const day = req.body.day
    const user_id = req.body.user_id
    const car_id = req.body.car_id
    const book = `INSERT INTO BOOKING (DAY, USER_ID, CAR_ID) VALUES ('${day}', '${user_id}',${car_id})`
    db.run(book, (err) => {
        if (err) {
            console.log(err)
            return res.send(err)
        }
        else
            return res.send(`successfully booked ${day}`)
    })
}))

            return res.send(`The user with the id ${req.params.id} is deleted`)
        }})})

