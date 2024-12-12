const express = require('express')
const server = express()
const db_access = require('./db.js')
const db = db_access.db
const port = 127
server.use(express.json()) //instead of using body parser

