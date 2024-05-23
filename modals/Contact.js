import { Sequelize, Model, DataTypes } from 'sequelize'

import dotenv from 'dotenv';
dotenv.config();

const dbName = process.env.DATABASE_NAME;
const dbUser = process.env.DATABASE_USERNAME;
const dbPass = process.env.DATABASE_PASSWORD;

const sequelize = new Sequelize(`mysql://root:${dbPass}@localhost:3306/${dbName}`);

class Contact extends Model {}

Contact.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  linkedId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  linkPrecedence: {
    type: DataTypes.ENUM('secondary', 'primary'),
    defaultValue: 'primary'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Contact',
  timestamps: true,
  paranoid: true
});

export default Contact;
// Synchronize the model with the database
// (async () => {
//   try {
//     console.log("Trying to call sync()...");
//     await Contact.sync();
//     console.log("Successfully created schema in database");
//   } catch (error) {
//     console.error("Failed to create schema in database:", error);
//   }
// })();
