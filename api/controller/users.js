const User = require("../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const process = require("../../nodemon.json");
const { remove } = require("../models/user");
const { use } = require("../routes/users");
const cryptoRandomString = require('crypto-random-string');

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
            if (user.length > 0) {
                return res.status(409).json({
                    message: "Username Already Exist.",
                });
            } else {
                User.find({ referal: req.body.referal })
                    .exec()
                    .then((usr) => {
                        if (usr.length <= 0) {
                            return res.status(409).json({
                                message: "Referal Code Not Exist",
                            });
                        } else {
                            var currentPosition;
                            var refferal;
                            if (usr[0].position == "superuser1") {
                                currentPosition = "superuser2";
                                refferal = cryptoRandomString({ length: 10 }).toString().toUpperCase();
                                signUp(currentPosition, refferal, req.body.referal);
                            } else {
                                currentPosition = "user";
                                refferal = cryptoRandomString({ length: 3 }).toString().toUpperCase()
                                signUp(currentPosition, refferal, usr[0].referalFrom);
                            }

                            function signUp(currentPosition, refferal, referalSU1) {
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
                                            position: currentPosition,
                                            password: hash,
                                            referal: refferal,
                                            referalFrom: req.body.referal,
                                            referalSU1: referalSU1
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




                        }

                    })
                    .catch((err) => {
                        res.status(500).json({
                            error: err,
                        });
                    });


            }
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        });
};

exports.super_user_1_signup = (req, res, next) => {
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
                            position: "superuser1",
                            password: hash,
                            referal: cryptoRandomString({ length: 5 }).toString().toUpperCase(),
                            referalFrom: req.body.referal
                        });
                        user
                            .save()
                            .then((result) => {
                                res.status(201).json({
                                    message: "User Created Successfully.",
                                    userCreated: {
                                        username: result.username,
                                        email: result.email,
                                        position: result.position,
                                        referal: result.referal
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
                            position: user[0].position,
                            referal: user[0].referal,
                            referalFrom: user[0].referalFrom,
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

exports.users_delete_all = (req, res, next) => {
    User.deleteMany().exec().then(message => {
        res.status(200).json({
            message: message
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        })
    });
}

exports.users_get_referal = (req, res, next) => {
    var refferal = req.params.referal;
    var position = req.params.position;

    if (position === "superuser1") {
        User.find({ referalSU1: refferal })
            .exec()
            .then((users) => {
                res.status(200).json({
                    count: users.length,
                    users: users
                })
            })
            .catch((err) => {
                res.status(500).json({
                    error: err,
                });
            });
    } else {
        User.find({ referalFrom: refferal })
            .exec()
            .then((users) => {
                res.status(200).json({
                    count: users.length,
                    users: users
                })
            })
            .catch((err) => {
                res.status(500).json({
                    error: err,
                });
            });
    }
}

exports.users_get_goverment = (req, res, next) => {
    var query = req.params.query;
    if (query === "0") {
        User.find({ position: "superuser2" })
            .exec()
            .then((users) => {
                res.status(200).json({
                    users
                })
            })
            .catch((err) => {
                res.status(500).json({
                    error: err,
                });
            });

    } else {
        User.find({ position: "superuser2" })
            .exec()
            .then((users) => {
                var newUsers = [];
                for (var i = 0; i < users.length; i++) {
                    if (users[i].username.includes(query)) {
                        newUsers.push(users[i]);
                    }
                }

                res.status(200).json({
                    newUsers
                })
            })
            .catch((err) => {
                res.status(500).json({
                    error: err,
                });
            });
    }



}