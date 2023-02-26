import shell from "shelljs"
import ControlEvents from "./ControlEvents.js"
import ControlAccess from "./ControlAccess.js"
import { bucket } from "./utils/firebase.js"
import { getWorldName, verifyNecessaryToolsInstaled } from "./utils/bedrockServer.js"
import cron from "node-cron"
import dotenv from "dotenv"
dotenv.config()

class BedrockServer{
    constructor(serverPath){
        this.path = serverPath,
        this.terminal = null,
        this.admins = [],
        this.players = [],
        this.online = 0,
        this.status = "offline",
        this.allowlist = this.path + "/allowlist.json",
        this.world = getWorldName(`${serverPath}/server.properties`),
        this.debug = (process.env.DEBUG==="true") ? true : false 
    }

    setup(){
        verifyNecessaryToolsInstaled()
        this.defineRoutine()
        this.update()
        this.init()
    }

    init(){
        this.start()
        ControlAccess.start()
        ControlEvents.start()
    }

    start(){
        shell.cd(this.path)
        this.terminal = shell.exec("./bedrock_server", {silent: !this.debug, async: true})
        
        console.log("Servidor inicializado!")
        this.status = "online"
    }

    stop(){
        ControlEvents.emitEvent("stop")
        ControlAccess.stop()
        this.status = "offline"
        this.terminal = null
    }

    async keepHealth(){
        this.stop()
        
        await this.backup()
        this.update()

        this.init()
    }

    update(){
        shell.cd(this.path)

        //Create temp path if not created
        if(!shell.exec("ls -d */", {silent: !this.debug}).stdout.includes("tmp")) shell.mkdir("tmp")
        const tmp = this.path + "/tmp"

        //Make backup
        const bkp = `${tmp}/bkp`
        shell.mkdir(bkp)
        shell.cp(`${this.path}/server.properties`, bkp)
        shell.cp(`${this.path}/permissions.json`, bkp)
        shell.cp(`${this.path}/allowlist.json`, bkp)

        //Dowload the latest version of bedrock server
        shell.touch(`${tmp}/version.html`)
        shell.exec(`curl -H "Accept-Encoding: identity" -H "Accept-Language: en" -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.33 (KHTML, like Gecko) Chrome/90.0.$RandNum.212 Safari/537.33" -o ${tmp}/version.html https://minecraft.net/en-us/download/server/bedrock/`, {silent: !this.debug})
        const DownloadURL = shell.exec(`grep -o 'https://minecraft.azureedge.net/bin-linux/[^"]*' ${tmp}/version.html`, {silent: !this.debug}).stdout
        const DownloadFile = "bedrock-server-latest.zip"
        shell.exec(`curl -H "Accept-Encoding: identity" -H "Accept-Language: en" -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.33 (KHTML, like Gecko) Chrome/90.0.$RandNum.212 Safari/537.33" -o ${tmp}/${DownloadFile} ${DownloadURL}`, {silent: !this.debug})

        //Apply changes
        shell.exec(`unzip -o ${tmp}/${DownloadFile} -d ${this.path}`, {silent: !this.debug})

        //Restore backup
        shell.mv(`${bkp}/server.properties`, this.path)
        shell.mv(`${bkp}/permissions.json`, this.path)
        shell.mv(`${bkp}/allowlist.json`, this.path)

        //Exclude tmp path
        shell.rm("-r", tmp)
        console.log("O Servidor já está atualizado!")
    }

    async backup(){
        shell.cd(this.path)

        //Create temp path if not created
        if(!shell.exec("ls -d */", {silent: !this.debug}).stdout.includes("tmp")) shell.mkdir("tmp")
        const tmp = this.path + "/tmp"


        //Make world backup
        shell.cd(tmp)
        const timestamp = new Date().getTime();
        const file = `${tmp}/world-backup-${timestamp}.zip`
        shell.exec(`zip -r ${file} ${this.path}/worlds/${this.world}`, {silent: !this.debug})
        
        //Upload world backup
        await bucket.upload(file)
            .then(() => {
                console.log("Backup feito com sucesso!")
                //Exclude tmp path
                shell.rm("-r", tmp)
            })
            .catch((err) => {
                console.error(`Erro ao fazer o backup, ${err}`)
                //Exclude tmp path
                shell.rm("-r", tmp)
            })


    }

    defineRoutine() {
        cron.schedule('0 5 * * *', () => {
            this.keepHealth();
        },{
            scheduled: false,
            timezone: "America/Sao_Paulo"
        });

        console.log("Tempo para manutenção definido com sucesso!")
    }
}

export default BedrockServer