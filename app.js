const express = require('express');
const app = express();
var cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const process = require('./nodemon.json')

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');
const deviceRoutes = require('./api/routes/devices');
const hardwareRoutes = require('./api/routes/hardware');
const scheduleRoutes = require('./api/routes/schedule');

mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'))
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-header', 'Origin, X-Reuested-With,Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', true);

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);
app.use('/devices', deviceRoutes);
app.use('/hardware', hardwareRoutes);
app.use('/schedule', scheduleRoutes);

app.use((req, res, next) => {
    const error = new Error('Pages Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;