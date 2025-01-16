const admin = require('firebase-admin');

const serviceAccount = require('./google-services.json'); // Replace with your Firebase service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function testFirebase() {
  try {
    const token = await admin.auth().createCustomToken('test-user');
    console.log('Firebase Admin Initialized Successfully:', token);
  } catch (error) {
    console.error('Firebase Initialization Error:', error.message);
  }
}

testFirebase();
module.exports = admin;
