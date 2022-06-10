const config = require('./utils/config');
const express = require('express');
const app = express();
const cors = require('cors');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const mongoose = require('mongoose');
const loginRouter = require('./controllers/login');

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
app.use(middleware.getTokenFrom);

app.use("/api/blogs", middleware.userExtractor, blogsRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

app.use(middleware.errorHandler);

module.exports = app;

