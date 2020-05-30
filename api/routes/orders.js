const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');

const Order = require('../models/order');
const Product = require('../models/product');

const OrdersController = require('../controller/orders');

router.get('/', checkAuth, OrdersController.orders_get_all);

router.post('/', checkAuth, OrdersController.orders_create_order);

router.get('/:orderId', checkAuth, OrdersController.orders_get_order);

router.delete('/:orderId', checkAuth, (req, res, next) => {
    const orderId = req.params.orderId;
    Order.deleteOne({ _id: orderId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Successfully deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/orders/',
                    body: {
                        productId: 'ID',
                        quantity: 'Number'
                    }
                }

            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
});

module.exports = router;