/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const Tour = require('../../models/tourModels');

// Connect to database
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// const DB = process.env.DATABASE_LOCAL;
mongoose.connect(DB, {}).then(() => {
  console.log('Connected to database');
});

//READ JSON FILE

const tours = fs.readFileSync(`${__dirname}/tours.json`, 'utf-8');
const parsedTours = JSON.parse(tours);

//IMPORT DATA INTO DATABASE
const importData = async () => {
  try {
    await Tour.create(parsedTours);
    console.log('Data imported successfully');
    mongoose.connection.close();
  } catch (error) {
    console.log(error);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted successfully');
    mongoose.connection.close().then(() => {
      console.log('Connection closed');
    });
  } catch (error) {
    console.log(error);
  }
};
console.log(process.argv[2]);
if (process.argv[2] === '--import') {
  importData();
  console.log('Data imported successfully');
} else if (process.argv[2] === '--delete') {
  deleteData();
  console.log('Data deleted successfully');
} else {
  console.log('provide valid argument');
}