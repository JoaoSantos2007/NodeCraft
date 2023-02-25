import { bedrock } from "../server.js"
import ControlAccess from "./ControlAccess.js"

class ControlEvents{
    static setup(){
        ControlEvents.handleServerEvents()
    }
    
    static handleServerEvents(){
        bedrock.terminal.stdout.on("data", (data) => {
            ControlEvents.verifyPlayerConnected(data)
            ControlEvents.verifyPlayerDisconnected(data)
        })
    }

    static emitEvent(cmd){
        bedrock.terminal.stdin.write(`${cmd} \n`)
    }

    static listAdminPlayers(){
        return new Promise((resolve, reject) => {
            const adminPlayersList = []

            if(!bedrock.players || !bedrock.admins) return resolve(adminPlayersList)
        
            bedrock.players.forEach((gamertag) => {
                bedrock.admins.forEach((admin) => {
                    if(admin.gamertag === gamertag) adminPlayersList.push(admin)
                })
            })

            return resolve(adminPlayersList)
        })
    }

    static async verifyPlayerConnected(output){
        if(output.includes("Player connected")){
            //Player Connected
            const gamertag = (output.split("] Player connected: ")[1]).split(",")[0]
            bedrock.players.push(gamertag)
            bedrock.online++            

            const admin = await ControlEvents.verifyPlayerIsAdmin(gamertag)

            if(admin) ControlAccess.applyRules()
        }
    }

    static async verifyPlayerDisconnected(output){
        if(output.includes("Player disconnected")){
            //Player Disconnected
            const gamertag = (output.split("] Player disconnected: ")[1]).split(",")[0]
            bedrock.players.splice(bedrock.players.indexOf(gamertag), 1)
            bedrock.online--

            const admin = await ControlEvents.verifyPlayerIsAdmin(gamertag)
    
            if(admin) ControlAccess.applyRules()
        }
    }

    static verifyPlayerIsAdmin(gamertag){
        return new Promise((resolve, reject) => {
            if(!bedrock.admins) return resolve(false)

            bedrock.admins.forEach((admin) => {
                if(admin.gamertag == gamertag) return resolve(admin)
            })

            return resolve(false)
        })
    }
}

export default ControlEvents