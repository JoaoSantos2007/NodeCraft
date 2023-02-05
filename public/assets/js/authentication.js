import { onAuthStateChanged, getAuth, signInWithRedirect, GoogleAuthProvider,OAuthProvider } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { verifyUserTemplate } from "./database.js";
import app from "./firebase.js";

const auth = getAuth(app);

function onUser(callback){
    onAuthStateChanged(auth, (user) => {
        if(!user) return

        callback(user)
    });
};

function login(provider){
    sessionStorage.setItem("verifiedUserTemplate", false)
    
    const googleProvider = new GoogleAuthProvider();
    const microsoftProvider = new OAuthProvider('microsoft.com');

    if(provider === "google") signInWithRedirect(auth, googleProvider);
    else if(provider === "microsoft") signInWithRedirect(auth, microsoftProvider)
}

onAuthStateChanged(auth,async (user) => {
    if(!user) return
    verifyUserTemplate(user)
});


export {onUser, auth, login}