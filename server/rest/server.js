const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

//Instansiate App
const app = express();
const PORT = process.env.PORT || 5000;

//Apply middlewares
app.use(cors());
app.use(morgan('short'));
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        ok: true,
        data: {
            message: 'Crackle REST API serving successfully',
        },
    })
});

//Error handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const error = err.error || 'Internal server error';
    res.status(status).json({
        ok: false,
        data: {},
        error: error,
    });
    process.env.NODE_ENV === 'development'?console.log(err):null;
});

//Route not found
app.use((req, res, next) => {
    res.status(404).json({
        ok: false,
        data: {},
        error: 'Route does not exist',
    });
});

app.listen(PORT, () => {
    console.log(`Server listening @${process.env.PORT}`);
});

