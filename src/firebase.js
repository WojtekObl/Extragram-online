// For Firebase JS SDK v7.20.0 and later, measurementId is optional

import firebase from "firebase";

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyA7578mec6FkHNMAqEw7gvOZSJjCpx-bJA",
    authDomain: "extragram-dc541.firebaseapp.com",
    projectId: "extragram-dc541",
    storageBucket: "extragram-dc541.appspot.com",
    messagingSenderId: "289701498953",
    appId: "1:289701498953:web:b7e8cd2cd5abef72faaf98",
    measurementId: "G-77QLEKQZZL"
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage()

export {db, auth, storage};

//   export default db;