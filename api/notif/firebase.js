var admin = require("firebase-admin");

var serviceAccount = require("./seti-apps.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://seti-apps.firebaseio.com"
});

module.exports.admin = admin