import { onAuthStateChanged, getAuth, signInWithRedirect, GoogleAuthProvider, OAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { verifyUserTemplate } from "./database.js";
import app from "./firebase.js";

const auth = getAuth(app);

function onUser(callback){
    onAuthStateChanged(auth, (user) => {
        if(user){
            callback(user)
        }else{
            //redirect to login page
            const url = `${window.location.protocol}//${window.location.host}`
            if(!window.location.href.includes("index.html")) window.location.assign(url + "/index.html")
        }
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

function logout(){
    signOut(auth)
}

export {onUser, auth, login, logout}