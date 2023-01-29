import {db} from "./assets/firebase-utils.js"
import fs from "fs"

class World{
    constructor(shell){
        this.shell = shell
        this.admins = {}
        this.players = []
        this.online = 0

        this.wipeAllowlist()
        this.handleServerEvents()
    }

    wipeAllowlist(){
        const allowlistPath = "../bedrock/allowlist.json"
        const data = JSON.stringify([])

        fs.writeFileSync(allowlistPath, data)
        this.shell.stdin.write(`allowlist reload\n`)
    }

    handleServerEvents(){
        this.shell.stdout.on("data", (data) => {
            this.verifyServerStarted(data)
            this.verifyPlayerConnected(data)
            this.verifyPlayerDisconnected(data)
        })
    }

    verifyServerStarted(output){
        if(output.includes("Server started")){
            console.log("Bedrock Server Started!")
            this.allowAdmins()
        }
    }

    verifyAdmin(gamertag){
        return this.admins[gamertag]
    }

    verifyPlayerConnected(output){
        if(output.includes("Player connected")){
            const gamertag = (output.split("] Player connected: ")[1]).split(",")[0]
            this.players.push(gamertag)
            this.online++            

            const admin = this.verifyAdmin(gamertag)

            if(admin) this.allowAdminAcceptPlayersList(admin.accept)
        }
    }

    verifyPlayerDisconnected(output){
        if(output.includes("Player disconnected")){
            const gamertag = (output.split("] Player disconnected: ")[1]).split(",")[0]
            this.players.splice(this.players.indexOf(gamertag), 1)
            this.online--

            const admin = this.verifyAdmin(gamertag)
    
            if(admin) this.denyAdminAcceptPlayersList(admin.accept)
        }
    }

    async allowAdmins(){
        const admins = await this.readAdminsFromDB()
        
        admins.forEach((admin) => {
            const user = admin.data()

            this.admins[user.gamertag] = user
            this.allowPlayer(user.gamertag)
        })
    }

    allowAdminAcceptPlayersList(lista){
        if(!lista) return

        lista.forEach((playerGamertag) => {
            this.allowPlayer(playerGamertag)
        })
    }

    verifyDenyAdminAcceptPlayersList(lista){
        const removePlayerFromDenyList = []
        const adminPlayers = this.listAdminPlayers()

        lista.forEach((gamertag) => {
            if(this.verifyAdmin(gamertag)) removePlayerFromDenyList.push(gamertag)

            adminPlayers.forEach((adminPlayer) => {
                if(adminPlayer.accept.includes(gamertag) && !removePlayerFromDenyList.includes(gamertag)) removePlayerFromDenyList.push(gamertag)
            })
        })

        const denyList = []
        lista.forEach((gamertag) => {
            if(!removePlayerFromDenyList.includes(gamertag)) denyList.push(gamertag)
        })

        return denyList
    }

    denyAdminAcceptPlayersList(lista){
        if(!lista) return

        lista = this.verifyDenyAdminAcceptPlayersList(lista)

        lista.forEach((playerGamertag) => {
            this.denyPlayer(playerGamertag)
        })
    }

    allowPlayer(gamertag){
        this.shell.stdin.write(`allowlist add ${gamertag}\n`)
    }

    denyPlayer(gamertag){
        this.shell.stdin.write(`allowlist remove ${gamertag}\n`)
    }

    listAdminPlayers(){
        const adminPlayers = []

        Object.keys(this.players).forEach((player) => {
            if(this.admins[player]) adminPlayers.push(this.admins[player])
        });

        return adminPlayers
    }

    async readAdminsFromDB(){
        const usersRef = db.collection("users");
        const queryPlayerAdmin = usersRef.where("admin", "==", true);
        const snapshot = await queryPlayerAdmin.get()
        
        return snapshot.docs
    }
}

export default World