require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


const startServer = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
  });
};

startServer();