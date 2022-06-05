const config = require('./utils/config');
const express = require('express');
const app = express();
const cors = require('cors');
const blogsRouter = require('./controllers/blogs');
const logger = require('./utils/logger');
const mongoose = require('mongoose');

logger.info("Connecting to MongoDB...");

mongoose.connect(config.MONGODB_URL)
    .then(() => {
        logger.info("Connected to MongoDB.");
    })
    .catch(error => {
        logger.error("Error connecting to MongoDB: ", error.message);
    });

app.use(cors());
app.use(express.json());

app.use("/api/blogs", blogsRouter);

module.exports = app;

