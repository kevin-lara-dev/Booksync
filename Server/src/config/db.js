const mysql = require("mysql2");
require("dotenv").config({ override: false });

const pool= mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections:true,
    connectionLimit:10,
    queueLimit:0
})

pool.getConnection((err, connection) => {
    if(err){
        console.error("error al conectar la base de datos:", err.message);
        process.exit(1);
    }
    console.log("conectado a la base de datos");
    connection.release();    
})

module.exports = pool.promise();