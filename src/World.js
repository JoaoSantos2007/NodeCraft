import User from "./User.js"
import fs from "fs"

class World{
    constructor(shell){
        this.shell = shell,
        this.admins = [],
        this.players = []

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

    async allowAdmins(){
        const admins = await User.getAdmins()
        
        admins.forEach((admin) => {
            const user = admin.data()
            this.allowPlayer(user.gamertag)
        })
    }

    verifyServerStarted(output){
        if(output.includes("Server started")){
            console.log("Bedrock Server Started!")
            this.allowAdmins()
        }
    }

    async verifyPlayerConnected(output){
        if(output.includes("Player connected")){
            const gamertag = (output.split("] Player connected: ")[1]).split(",")[0]
            const isAdmin = await User.verifyUserAdmin(gamertag)
    
            if(isAdmin){
                const user = isAdmin.data()

                this.admins.push(user)                
                this.allowAdminAcceptPlayersList(user.accept)
            }else{
                this.users.push(gamertag)
            }
        }
    }

    async verifyPlayerDisconnected(output){
        if(output.includes("Player disconnected")){
            const gamertag = (output.split("] Player disconnected: ")[1]).split(",")[0]
            const isAdmin = await User.verifyUserAdmin(gamertag)
    
            if(isAdmin){
                const user = isAdmin.data()

                this.admins.splice(this.admins.indexOf(user), 1)
                this.denyAdminAcceptPlayersList(user.accept)
            }else{
                this.users.splice(this.users.indexOf(gamertag), 1)
            }
        }
    }

    allowAdminAcceptPlayersList(lista){
        if(!lista) return

        lista.forEach((playerGamertag) => {
            this.allowPlayer(playerGamertag)
        })
    }

    denyAdminAcceptPlayersList(lista){
        if(!lista) return

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
}

export default World