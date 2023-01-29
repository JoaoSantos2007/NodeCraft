import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-analytics.js";


const firebaseConfig = {
apiKey: "AIzaSyA2x-_Q36-K9LzRkbuf1aCrVZjc9tg9kOw",
authDomain: "minecraft-dev-2d21a.firebaseapp.com",
projectId: "minecraft-dev-2d21a",
storageBucket: "minecraft-dev-2d21a.appspot.com",
messagingSenderId: "443196344342",
appId: "1:443196344342:web:4ed2f7a233bd7a37f50d37",
measurementId: "G-T49K4RF9Q8"
};

const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export default app