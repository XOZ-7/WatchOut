import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

    apiKey: "AIzaSyCKme_0-NccrMC4YGUO2x-h4iLoCh0Gaj8",

    authDomain: "watchout-34845.firebaseapp.com",

    projectId: "watchout-34845",

    storageBucket: "watchout-34845.firebasestorage.app",

    messagingSenderId: "517891186005",

    appId: "1:517891186005:web:533a0dad3ef5608103a3dc",

    measurementId: "G-12716EWYSJ"

  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);