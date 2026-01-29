import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAotL3T-CGSl4A5fOufUpdm-PLmRZf4uiE",
    authDomain: "rel-among-us.firebaseapp.com",
    projectId: "rel-among-us",
    databaseURL: "https://rel-among-us-default-rtdb.firebaseio.com/",
    storageBucket: "rel-among-us.firebasestorage.app",
    messagingSenderId: "496715666522",
    appId: "1:496715666522:web:4469732cd95f50a866b463"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);