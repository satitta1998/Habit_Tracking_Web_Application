/** Required in frontend because it lets client-side app know how to connect to Firebase project using the client SDK. */

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth } from "firebase/auth";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDyPuJxmynmkPesx8h4e6EuvdShFp42ETE",
  authDomain: "habit-tracking-web.firebaseapp.com",
  projectId: "habit-tracking-web",
  storageBucket: "habit-tracking-web.firebasestorage.app",
  messagingSenderId: "1049337366613",
  appId: "1:1049337366613:web:3ac250877fd08047682cdc"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app)