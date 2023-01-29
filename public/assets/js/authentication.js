import { onAuthStateChanged, getAuth, signInWithRedirect, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { verifyUserTemplate } from "./database.js";
import app from "./firebase.js";

const auth = getAuth(app);

function onUser(callback){
    onAuthStateChanged(auth, (user) => {
        if(!user) return

        callback(user)
    });
};

function login(){
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
}

onAuthStateChanged(auth,async (user) => {
    if(!user) return
    verifyUserTemplate(user)
});


export {onUser, auth, login}