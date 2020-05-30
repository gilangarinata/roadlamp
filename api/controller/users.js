const User = require("../models/user");
const mongoose = require("mongoose");

exports.users_signup = (req, res, next) => {
    User.find({ username: req.body.username })
        .exec()
        .then((user) => {
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
                            password: hash,
                        });
                        user
                            .save()
                            .then((result) => {
                                res.status(201).json({
                                    message: "User Created Successfully.",
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
                            expiresIn: "1d",
                        }
                    );

                    return res.status(200).json({
                        message: "Authentication Success.",
                        token: token,
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