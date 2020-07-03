const User = require("../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const process = require("../../nodemon.json");
const { remove } = require("../models/user");
const { use } = require("../routes/users");

exports.show_all = (req, res, next) => {
    User.find().exec().then((user) => {
        res.status(200).json({
            users: user
        })
    }).catch((err) => {
        res.status(500).json({
            error: err,
        });
    });
}


exports.users_signup = (req, res, next) => {
    User.find({ username: req.body.username })
        .exec()
        .then((user) => {
            console.log(req.body.username)
            if (user.length > 0) {
                return res.status(409).json({
                    message: "Username Already Exist.",
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err,
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            username: req.body.username,
                            email: req.body.email,
                            position: req.body.position,
                            password: hash,
                        });
                        user
                            .save()
                            .then((result) => {
                                res.status(201).json({
                                    message: "User Created Successfully.",
                                    userCreated: {
                                        username: result.username,
                                        email: result.email,
                                        position: result.position
                                    }
                                });
                            })
                            .catch((err) => {
                                res.status(500).json({
                                    error: err,
                                });
                            });
                    }
                });
            }
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        });
};

exports.users_login = (req, res, next) => {
    User.find({ username: req.body.username })
        .exec()
        .then((user) => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Username Doesn't Exist.",
                });
            }

            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: "Authentication Failed",
                    });
                }
                if (result) {
                    const token = jwt.sign({
                            username: user[0].username,
                            password: user[0].password,
                        },
                        process.env.JWT_KEY, {
                            expiresIn: "30d",
                        }
                    );

                    return res.status(200).json({
                        message: "Authentication Success.",
                        token: token,
                        userInfo: {
                            _id: user[0]._id,
                            username: user[0].username,
                            email: user[0].email,
                            position: user[0].position
                        }
                    });
                }

                res.status(401).json({
                    message: "Authentication failed",
                });
            });
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        });
};

exports.users_delete = (req, res, next) => {
    User.deleteOne({ _id: req.params.userId })
        .exec()
        .then((result) => {
            res.status(200).json({
                message: "User deleted",
            });
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        });
};

exports.delete_all = (req, res, next) => {
    var key = req.params.key;

    if (key = "imsuretodelete") {
        User.remove({})
            .exec()
            .then((result) => {
                res.status(200).json({
                    message: "User deleted",
                    result: result
                });
            })
            .catch((err) => {
                res.status(500).json({
                    error: err,
                });
            });
    } else {
        res.status(200).json({
            message: "wrong key",
            result: result
        });
    }

};