import { db } from "./assets/firebase-utils.js"
import fs from "fs"

class World{
    constructor(terminal, bedrockPath){
        this.terminal = terminal
        this.shell = (cmd) => {terminal.stdin.write(`${cmd}\n`)}
        this.path = bedrockPath
        this.admins = []
        this.players = []
        this.online = 0
        
        this.setupWorld()
    }

    /*
    ====================================
        Start The Bedrock Server
    ====================================
    */
    
    setupWorld(){
        console.log("Bedrock Server Started!")
        
        this.syncAdminsListFromDB()
        this.handleServerEvents()
    }

    syncAdminsListFromDB(){
        const query = db.collection('users').where('admin', '==', true);

        query.onSnapshot(querySnapshot => {
            const docs = querySnapshot.docs
            this.admins = []

            docs.forEach((doc) => {
                this.admins.push(doc.data())
            })

            this.updateAllowList()
        })
    }

    handleServerEvents(){
        this.terminal.stdout.on("data", (data) => {
            this.verifyPlayerConnected(data)
            this.verifyPlayerDisconnected(data)
        })
    }

    /*
    ====================================
                Allowlist
    ====================================
    */

    wipeAllowList(){
        const allowList = `${this.path}/allowlist.json`
        fs.writeFileSync(allowList, JSON.stringify([]))
    }

    readAllowlist(){
        return new Promise((resolve, reject) => {
            const allowList = `${this.path}/allowlist.json`
            const rawdata = fs.readFileSync(allowList);
            const data = JSON.parse(rawdata);
            
            if(data){
                const gamertags = []
                data.forEach((player) => {
                    gamertags.push(player.name)
                })

                resolve(gamertags)
            }else{
                resolve([])
            }
        })
    }

    allowPlayer(gamertag){
        const allowList = `${this.path}/allowlist.json`

        const rawdata = fs.readFileSync(allowList);
        const data = JSON.parse(rawdata);

        data.push({
            "ignoresPlayerLimit": false,
            "name": gamertag
        })

        fs.writeFileSync(allowList, JSON.stringify(data))
    }

    addAdminsToAllowList(){
        return new Promise((resolve, reject) => {
            if(!this.admins) return
        
            this.admins.forEach((admin) => {
                this.allowPlayer(admin.gamertag)
            })

            resolve(true)
        })
    }

    async allowAdminsAcceptList(){
        return new Promise(async (resolve, reject) => {
            const adminPlayers = await this.listAdminPlayers()
            if(!adminPlayers) return resolve(true)
    
            adminPlayers.forEach((admin) => {
                admin.accept.forEach((gamertag) => {
                    this.allowPlayer(gamertag)
                })
            })

            resolve(true)
        })
    }

    async removeNotAllowedPlayers(){
        const allowedPlayers = await this.readAllowlist()

        if(!this.players || !allowedPlayers) return

        this.players.forEach((player) => {
            if(!allowedPlayers.includes(player)) this.kickPlayer(player)
        })
    }

    async updateAllowList(){
        this.wipeAllowList()
        await this.addAdminsToAllowList()
        await this.allowAdminsAcceptList()
        this.shell("allowlist reload")
        await this.removeNotAllowedPlayers()
    }


    /*
    ====================================
                  Main
    ====================================
    */

    async verifyPlayerConnected(output){
        if(output.includes("Player connected")){
            //Player Connected
            const gamertag = (output.split("] Player connected: ")[1]).split(",")[0]
            this.players.push(gamertag)
            this.online++            

            const admin = await this.verifyPlayerIsAdmin(gamertag)

            if(admin) this.updateAllowList()
        }
    }

    async verifyPlayerDisconnected(output){
        if(output.includes("Player disconnected")){
            //Player Disconnected
            const gamertag = (output.split("] Player disconnected: ")[1]).split(",")[0]
            this.players.splice(this.players.indexOf(gamertag), 1)
            this.online--

            const admin = await this.verifyPlayerIsAdmin(gamertag)
    
            if(admin) this.updateAllowList()
        }
    }

    listAdminPlayers(){
        return new Promise((resolve, reject) => {
            const adminPlayersList = []

            if(!this.players || !this.admins) return resolve(adminPlayersList)
        
            this.players.forEach((gamertag) => {
                this.admins.forEach((admin) => {
                    if(admin.gamertag === gamertag) adminPlayersList.push(admin)
                })
            })

            return resolve(adminPlayersList)
        })
    }

    verifyPlayerIsAdmin(gamertag){
        return new Promise((resolve, reject) => {
            if(!this.admins) return resolve(false)

            this.admins.forEach((admin) => {
                if(admin.gamertag == gamertag) return resolve(admin)
            })

            return resolve(false)
        })
    }

    kickPlayer(gamertag){
        this.shell(`kick ${gamertag}`)
    }
}

export default World