const Order = require('../models/order');
const mongoose = require('mongoose');


exports.orders_get_all = (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        .populate('product', '_id name')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.count,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc._id
                        }
                    }
                }),

            });
        })
        .catch(err => {
            res.status(500).json({ error: err })
        });
}

exports.orders_create_order = (req, res, next) => {
    Product.findById(req.body.productId)
        .exec()
        .then(product => {

            if (!product) {
                return res.status(404).json({
                    message: 'Product Not found'
                })
            }

            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            return order
                .save()
                .then(result => {
                    res.status(201).json({
                        message: 'Order stored',
                        createdOrder: {
                            _id: result._id,
                            product: result.product,
                            quantity: result.quantity
                        },
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + result._id
                        }
                    });
                });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

exports.orders_get_order = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .populate('product', '_id name')
        .exec()
        .then(order => {
            if (!order) {
                return res.status(404).json({
                    message: "Order Not found"
                })
            }

            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/'
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
};