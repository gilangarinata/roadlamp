var admin = require("firebase-admin");

var serviceAccount = require("./seti-app-flutter.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://seti-app-flutter.firebaseio.com"
});

module.exports.admin = admin