const express = require('express');
const { initializeDatabase } = require('../config/database');
const router = require('./router');
const cors = require('cors');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const app = express();
const port = Number(process.env.PORT) || 3030;

app.use(cors());
app.use((req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
        res.cookie('name', 'value', {
            sameSite: 'None',
            secure: isProduction,
            httpOnly: true
        });
    }

    next();
});
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: false }));
app.use(router);
app.use(notFoundHandler);
app.use(errorHandler);

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

initializeDatabase()
    .then(() => {
        console.log(">>>>> Database connected successfully! <<<<<");
        app.listen(port, () => console.log(`>> * Server is working at: http://localhost:${port} * <<`));
    })
    .catch(err => {
        console.log('>>>>> Database connection error <<<<<');
        console.log('Error: ' + err.message);
    });