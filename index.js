const express =require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app=express()
const port=3000;
const dbName = process.env.DATABASE_NAME;
const dbUser = process.env.DATABASE_USERNAME;
const dbPass = process.env.DATABASE_PASSWORD;

const connect =  () => {
    try {
      const connection =  mysql.createConnection({
        host: 'localhost',
        user: dbUser,
        password: dbPass, // Your password here, if any
        database: dbName
      });
  
      connection.connect(error => {
        if (error) console.log(error);
        else console.log('Created connection with database successfully');
      });
    } catch (error) {
      console.log(error);
    }
  };
app.get('/',(req,res)=>{
    res.send("Server started")
})
app.listen(port,()=>{
    connect()
  console.log(`app is listening at Port ${port}`);
})