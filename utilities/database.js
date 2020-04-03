const mysql = require('mysql2/promise');
require('dotenv').config('.env');
let database_1 = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'rawa_tv',
    waitForConnections: true
}

let database_2 = {
    // ANOTHER CONFIG
}
function mainDB() {
    return mysql.createConnection(database_1);

}

function sub() {
    return mysql.createConnection(database_2);
}


function connection() {
    try {
        const pool = mysql.createPool(database_1);
        console.log("Connected to MySQL");
        return pool;
    } catch(e) {
        return console.log("Count not connect to database rawa_tv");
    }
}

const pool = connection();

module.exports = {
    mainDB,
    connection: async () =>  pool.getConnection(),
    execute: (...params) => pool.execute(...params),
    pool
};