const admin = require('firebase-admin');
const serviceAccount = require('../projectsubmission-f8f6f-firebase-adminsdk-ik3zu-5e054f5b01.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://projectsubmission-f8f6f.appspot.com'
});

const bucket = admin.storage().bucket();

module.exports = bucket;
