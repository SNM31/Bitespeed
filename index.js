import identityRoute from './routes/identity.js';
import express from 'express'
import mysql from 'mysql2'
import dotenv from 'dotenv';
dotenv.config();


const app = express();
app.use(express.json());
const port = 3000;
const dbName = process.env.DATABASE_NAME;
const dbUser = process.env.DATABASE_USERNAME;
const dbPass = process.env.DATABASE_PASSWORD;

const connect = () => {
  try {
    const connection = mysql.createConnection({
      host: 'localhost',
      user: dbUser,
      password: dbPass,
      database: dbName
    });

    connection.connect(error => {
      if (error) console.error('Database connection failed:', error);
      else console.log('Created connection with database successfully');
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  }
};

app.use('/identity', identityRoute); // Corrected the route path

app.get('/', (req, res) => {
  res.send("Server started");
});

app.listen(port, () => {
  connect();
  console.log(`App is listening at port ${port}`);
});
