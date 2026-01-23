import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCFoicvBGckX61EWqsDYn6zxLqcVmtpcK8",
  authDomain: "todo-list-reactapp-b144d.firebaseapp.com",
  projectId: "todo-list-reactapp-b144d",
  storageBucket: "todo-list-reactapp-b144d.firebasestorage.app",
  messagingSenderId: "487135004573",
  appId: "1:487135004573:web:fcbadea479160a71045174",
  measurementId: "G-L3S1QFX7NV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
