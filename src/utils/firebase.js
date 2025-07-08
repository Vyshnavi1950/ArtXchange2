// src/utils/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDm3P4p-3__Y9m8IqO4xAe6jTYaWWCyuFY",
  authDomain: "artxchange-ec97e.firebaseapp.com",
  projectId: "artxchange-ec97e",
  storageBucket: "artxchange-ec97e.appspot.com", // ✅ FIXED: correct this!
  messagingSenderId: "1035838455808",
  appId: "1:1035838455808:web:6f93dd525cd5ba93c8d8e5",
  measurementId: "G-H7BJ52529X",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
