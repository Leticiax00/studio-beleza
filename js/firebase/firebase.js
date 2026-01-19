console.log("firebase.js loaded");
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBKumhhmyToRt98WIJ9ldmQw09z_BDe1IY",
  authDomain: "salao-6387e.firebaseapp.com",
  projectId: "salao-6387e",
  storageBucket: "salao-6387e.firebasestorage.app",
  messagingSenderId: "125468712135",
  appId: "1:125468712135:web:cdb4ac3b3490c561e9b2e2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
