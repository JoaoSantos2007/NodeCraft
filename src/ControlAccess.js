import { db } from "./utils/firebase-utils.js"
import { bedrock } from "../server.js";
import ControlEvents from "./ControlEvents.js";
import Allowlist from "./Allowlist.js";

class ControlAccess{
    static start(){
        ControlAccess.syncDB()
    }

    static stop(){
        const unsub = db.collection('users').where('admin', '==', true).onSnapshot(() => {})

        unsub()
    }

    static syncDB(){
        const query = db.collection('users').where('admin', '==', true);

        query.onSnapshot(querySnapshot => {
            const docs = querySnapshot.docs
            bedrock.admins = []

            docs.forEach((doc) => {
                bedrock.admins.push(doc.data())
            })

            this.applyRules()
        })
    }

    static async applyRules(){
        Allowlist.wipe()
        await ControlAccess.allowAdmins()
        await ControlAccess.allowAdminsAcceptList()
        Allowlist.reload()
        await ControlAccess.removeNotAllowedPlayers()
    }

    static allowAdmins(){
        return new Promise((resolve, reject) => {
            if(!bedrock.admins) return
        
            bedrock.admins.forEach((admin) => {
                Allowlist.allow(admin.gamertag)
            })

            resolve(true)
        })
    }

    static allowAdminsAcceptList(){
        return new Promise(async (resolve, reject) => {
            const adminPlayers = await ControlEvents.listAdminPlayers()
            if(!adminPlayers) return resolve(true)
    
            adminPlayers.forEach((admin) => {
                admin.accept.forEach((gamertag) => {
                    Allowlist.allow(gamertag)
                })
            })

            resolve(true)
        })
    }

    static async removeNotAllowedPlayers(){
        const allowedPlayers = await Allowlist.read()

        if(!bedrock.players || !allowedPlayers) return

        bedrock.players.forEach((player) => {
            if(!allowedPlayers.includes(player)) ControlAccess.kickPlayer(player)
        })
    }

    static kickPlayer(gamertag){
        ControlEvents.emitEvent(`kick ${gamertag}`)
    }
}

export default ControlAccess