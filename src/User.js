import {db} from "./assets/firebase-utils.js"

class User{
    static async verifyUserAdmin(gamertag){
        const usersRef = db.collection("users");
        const queryPlayerAdmin = usersRef.where("gamertag", "==", gamertag).where("admin", "==", true);
        const snapshot = await queryPlayerAdmin.get()
        
        return snapshot.docs[0]
    }

    static async getAdmins(){
        const usersRef = db.collection("users");
        const queryPlayerAdmin = usersRef.where("admin", "==", true);
        const snapshot = await queryPlayerAdmin.get()
        
        return snapshot.docs
    }
}

export default User