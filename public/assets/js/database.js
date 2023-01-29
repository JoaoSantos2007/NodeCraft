import {getFirestore, setDoc, doc, getDoc} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import app from "./firebase.js";

const db = getFirestore(app);

async function createUserTemplate(email,uid){
    const data = {
        "email": email,
        "admin": false,
        "accept": []    
    };

    await setDoc(doc(db, "users", uid), data);
}

async function verifyUserTemplate(user){
    if(sessionStorage.getItem("verifiedUserTemplate")) return

    const uid = user.uid
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if(!userSnap.exists()) createUserTemplate(user.email, uid)
    sessionStorage.setItem("verifiedUserTemplate", true)
}

export {verifyUserTemplate, createUserTemplate, db}