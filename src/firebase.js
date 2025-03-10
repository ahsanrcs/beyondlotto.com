import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyAyKoil-Fz310a2e0IUAJHl1qdaYdObQqM",
	authDomain: "tv-display-app.firebaseapp.com",
	projectId: "tv-display-app",
	storageBucket: "tv-display-app.appspot.com",
	messagingSenderId: "399583310408",
	appId: "1:399583310408:web:413c043d80d5f90fa35e7d",
	measurementId: "G-Z5YJN6BFQT",
};

const app = initializeApp(firebaseConfig);
const secondApp = initializeApp(firebaseConfig, "secondApp");
const auth = getAuth(app);
const auth2 = getAuth(secondApp);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, auth, auth2, storage };
