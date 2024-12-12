const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('car_search.db')

//USERS TABLE
const create_users_table = `CREATE TABLE IF NOT EXISTS USERS
(ID INTEGER PRIMARY KEY AUTOINCREMENT, 
NAME TEXT NOT NULL, 
EMAIL TEXT UNIQUE NOT NULL, 
PASSWORD TEXT NOT NULL, 
USER_ROLE TEXT NOT NULL, 
ISADMIN INT)`


