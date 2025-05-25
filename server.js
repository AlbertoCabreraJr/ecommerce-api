require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet')
const cookieParser = require('cookie-parser');  

const { connectDB } = require('./config/db');
const router = require('./routes/router');

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet())
app.use(cors());
app.use((req, res, next) => {
  if (req.originalUrl === '/api/orders/webhook') {
    express.raw({ type: 'application/json' })(req, res, next)
  } else {
    express.json()(req, res, next)
  }
});
app.use(morgan('dev'));
app.use(cookieParser());

app.use("/api", router)

const startServer = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
  });
};

startServer();