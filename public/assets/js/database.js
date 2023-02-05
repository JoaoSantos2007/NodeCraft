import {getFirestore, setDoc, doc, onSnapshot, getDoc, updateDoc, arrayUnion, arrayRemove} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import app from "./firebase.js";

const db = getFirestore(app);

async function createUserTemplate(email,uid){
    const data = {
        "email": email,
        "admin": false,
        "accept": [],
        "gamertag": ""    
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

async function getUserTemplateOnChange(user, callback){
    const uid = user.uid
    const userRef = doc(db, "users", uid);

    onSnapshot(userRef, (doc) => {
        callback(doc.data())
    });
}

async function pushUserToAcceptList(gamertag, user){
    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
        accept: arrayUnion(gamertag)
    });
}

async function removeUserFromAcceptList(gamertag, user){
    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
        accept: arrayRemove(gamertag)
    });
}

export {verifyUserTemplate, createUserTemplate, getUserTemplateOnChange, pushUserToAcceptList, removeUserFromAcceptList, db}