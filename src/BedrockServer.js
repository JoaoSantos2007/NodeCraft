import shell from "shelljs"
import ControlEvents from "./ControlEvents.js"
import ControlAccess from "./ControlAccess.js"
import { bucket } from "./utils/firebase-utils.js"
import dotenv from "dotenv"
dotenv.config()

class BedrockServer{
    constructor(serverPath, bedrockWorldName){
        this.path = serverPath,
        this.terminal = null,
        this.admins = [],
        this.players = [],
        this.online = 0,
        this.status = "offline",
        this.allowlist = this.path + "/allowlist.json",
        this.world = bedrockWorldName,
        this.debug = process.env.DEBUG
    }

    setup(){
        this.init()
    }

    async init(){
        await this.backup()
        this.update()
        this.start()
        ControlAccess.setup()
        ControlEvents.setup()
    }

    start(){
        shell.cd(this.path)
        this.terminal = shell.exec("./bedrock_server", {silent: this.debug, async: true})
        
        console.log("Bedrock Server Started!")
        this.status = "online"
    }

    stop(){
        ControlEvents.emitEvent("stop")
        ControlAccess.stop()
        this.status = "offline"
        this.terminal = null
    }

    update(){
        shell.cd(this.path)

        //Create temp path if not created
        if(!shell.exec("ls -d */", {silent: this.debug}).stdout.includes("tmp")) shell.mkdir("tmp")
        const tmp = this.path + "/tmp"

        //Make backup
        const bkp = `${tmp}/bkp`
        shell.mkdir(bkp)
        shell.cp(`${this.path}/server.properties`, bkp)
        shell.cp(`${this.path}/permissions.json`, bkp)
        shell.cp(`${this.path}/allowlist.json`, bkp)

        //Dowload the latest version of bedrock server
        shell.touch(`${tmp}/version.html`)
        shell.exec(`curl -H "Accept-Encoding: identity" -H "Accept-Language: en" -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.33 (KHTML, like Gecko) Chrome/90.0.$RandNum.212 Safari/537.33" -o ${tmp}/version.html https://minecraft.net/en-us/download/server/bedrock/`, {silent: this.debug})
        const DownloadURL = shell.exec(`grep -o 'https://minecraft.azureedge.net/bin-linux/[^"]*' ${tmp}/version.html`, {silent: this.debug}).stdout
        const DownloadFile = "bedrock-server-latest.zip"
        shell.exec(`curl -H "Accept-Encoding: identity" -H "Accept-Language: en" -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.33 (KHTML, like Gecko) Chrome/90.0.$RandNum.212 Safari/537.33" -o ${tmp}/${DownloadFile} ${DownloadURL}`, {silent: this.debug})

        //Apply changes
        shell.exec(`unzip -o ${tmp}/${DownloadFile} -d ${this.path}`, {silent: this.debug})

        //Restore backup
        shell.mv(`${bkp}/server.properties`, this.path)
        shell.mv(`${bkp}/permissions.json`, this.path)
        shell.mv(`${bkp}/allowlist.json`, this.path)

        //Exclude tmp path
        shell.rm("-r", tmp)
        console.log("Bedrock Server is up to date!")
    }

    async backup(){
        shell.cd(this.path)

        //Create temp path if not created
        if(!shell.exec("ls -d */", {silent: this.debug}).stdout.includes("tmp")) shell.mkdir("tmp")
        const tmp = this.path + "/tmp"


        //Make world backup
        shell.cd(tmp)
        const timestamp = new Date().getTime();
        const file = `${tmp}/world-backup-${timestamp}.zip`
        shell.exec(`zip -r ${file} ${this.path}/worlds/${this.world}`, {silent: this.debug})
        
        //Upload world backup
        await bucket.upload(file)
            .then(() => {
                console.log("Backup feito com sucesso!")
                //Exclude tmp path
                shell.rm("-r", tmp)
            })
            .catch((err) => {
                console.error(`Erro ao fazer o backup! ${err}`)
                //Exclude tmp path
                shell.rm("-r", tmp)
            })


    }
}

export default BedrockServer