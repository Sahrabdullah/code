const express = require('express') //library
const cors = require('cors'); //connect frontend and backend
const jwt = require('jsonwebtoken') //genrate a token
const bcrypt = require('bcrypt'); //hashing 
const cookieParser = require('cookie-parser'); //generating cookie
const server = express()
const db_access = require('./db.js')
const db = db_access.db
const port = 127
const secret_key = 'poiuytrewqasdfghjklmnbvcxz' // ecncrpt the hashing
server.use(cors({
    origin: "http://localhost:3000", //http for react 
    credentials: true
}))
server.use(express.json()) //instead of using body parser
server.use(cookieParser())
const generateToken = (id, isADMIN) => {
    return jwt.sign({ id, isADMIN }, secret_key, { expiresIn: '5h' })
}
const verifyToken = (req, res, next) => {
    const token = req.cookies.authToken
    if (!token)
        return res.status(401).send('unauthorized')
    jwt.verify(token, secret_key, (err, details) => {
        if (err)
            return res.status(403).send('invalid or expired token')
        req.userDetails = details

        next()
    })
}

//USER
//REGISTERATION
server.post(`/user/register`, (req, res) => { //req body
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const user_role = req.body.user_role
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).send('error hashing password')
        }
        const content = `INSERT INTO USERS (NAME,EMAIL,PASSWORD,USER_ROLE, isADMIN) VALUES (?,?,?,?,?)`
        db.run(content, [name, email, hashedPassword, user_role, 0], (err) => {
            if (err) {
                console.log(err.message)
                return res.status(401).send(`Registration Failed`)     //401 is unauthorized user
            }
            else
                return res.status(200).send(`Registered Successfully`)      //20 is OK
        })
    })
})


//LOGIN
server.post(`/user/login`, (req, res) => { //req body
    const email = req.body.email
    const password = req.body.password

    db.get(`SELECT * FROM USERS WHERE EMAIL=?`, [email], (err, row) => {
        bcrypt.compare(password, row.PASSWORD, (err, isMatch) => {
            if (err)
                return res.status(500).send(`error comparing passwords.`) //401 is unauthorized user
            if (!isMatch) {
                return res.status(401).send(`Failed to login`)
            }
            else {
                let userID = row.ID
                let isAdmin = row.ISADMIN
                const token = generateToken(userID, isAdmin)

                res.cookie('authToken', token, {
                    httpOnly: true,
                    sameSite: 'none',
                    secure: true,
                    expiresIn: '5h'
                })
                return res.status(201).send(`Login Successfull`)  //201 is created
            }
        })
    })
})

//GET ALL USERS
// ---- ADMIN
server.get(`/users`, verifyToken, (req, res) => { //req body
    const isAdmin = req.userDetails.isAdmin;
    if (isAdmin !== 1)
        return res.status(403).send(`you are not an admin`)
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
// ---ADMIN
server.delete(`/user/delete/:id`, verifyToken, (req, res) => {
    const isAdmin = req.userDetails.isAdmin;
    if (isAdmin !== 1)
        return res.status(403).send(`you are not an admin`)
    const user = `DELETE FROM USERS WHERE ID = ${req.params.id}`
    db.run(user, (err) => {
        if (err) {
            console.log(err)
            return res.send(err)
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
server.put(`/cars/edit/:id`, verifyToken, (req, res) => {
    const isAdmin = req.userDetails.isAdmin;
    if (isAdmin !== 1)
        return res.status(403).send(`you are not an admin`)
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
server.delete(`/cars/deletecar/:id`, verifyToken, (req, res) => {
    const isAdmin = req.userDetails.isAdmin;
    if (isAdmin !== 1)
        return res.status(403).send(`you are not an admin`)
    const car = `DELETE FROM CARS WHERE ID = ${req.params.id}`
    db.run(car, (err, row) => {
        if (err) {
            console.log(err)
            return res.send(err)
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
server.get(`/reviews`, verifyToken, (req, res) => { //req body
    const isAdmin = req.userDetails.isAdmin;
    if (isAdmin !== 1)
        return res.status(403).send(`you are not an admin`)
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
server.delete(`/deletereview/:id`, verifyToken, (req, res) => {
    const isAdmin = req.userDetails.isAdmin;
    if (isAdmin !== 1)
        return res.status(403).send(`you are not an admin`)
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

//GET ALL BOOKINGS
//-- ADMIN
server.get(`/booking`, verifyToken, (req, res) => {
    const isAdmin = req.userDetails.isAdmin;
    if (isAdmin !== 1)
        return res.status(403).send(`you are not an admin`)
    const bookings = `SELECT * FROM BOOKING`
    db.all(bookings, (err, rows) => {
        if (err) {
            console.log(err)
            return res.send(err)
        }
        else
            return res.send(rows)
    })
})

// DELETE BOOKINGS
//-- ADMIN
server.delete(`/delete/book/:id`, verifyToken, (req, res) => {
    const isAdmin = req.userDetails.isAdmin;
    if (isAdmin !== 1)
        return res.status(403).send(`you are not an admin`)
    const books = `DELETE FROM BOOKING WHERE ID = ${req.params.id}`
    db.run(books, (err) => {
        if (err) {
            console.log(err)
            return res.send(err)
        }
        else
            return res.send(`The user with the id ${req.params.id} is deleted`)
    })
})

server.listen(port, (error) => {
    if (error) {
        console.log('The server did not start:', error)
        return
    }
    db.serialize(() => {
        console.log(`server started at port ${port}`)
        db.serialize(() => {
            db.run(db_access.create_users_table, (err) => {
                if (err)
                    console.log("error creating user table " + err)
            });
            db.run(db_access.create_cars_table, (err) => {
                if (err)
                    console.log("error creating cars table " + err)
            });
            db.run(db_access.create_user_booking_table, (err) => {
                if (err)
                    console.log("error creating booking table " + err)
            });
            db.run(db_access.create_feedback_table, (err) => {
                if (err)
                    console.log("error creating feedback table " + err)
            });
        })
    })
})