import express from'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import app from './server/app.js';
import connectDB from './server/config/config.js'; //change to devConfig with your mongo database URL

const server = express();

server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

connectDB();

server.use('/', app);


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  console.log(`MongoDB Database name: Skeleton`);
  console.log(`Running on: http://localhost:${PORT}`);
});