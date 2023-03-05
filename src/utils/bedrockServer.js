import properties from "properties-parser"
import shell from "shelljs"
import { bucket } from "./firebase.js"

function getWorldName(serverProperties){
    const serverPropertiesData = properties.read(serverProperties)
    const worldName = serverPropertiesData["level-name"]

    return worldName
}

function verifyNecessaryToolsInstaled(){
    const necessaryTools = [
        "curl",
        "zip",
        "unzip",
        "mv",
        "ls",
        "cp",
        "rm",
        "mkdir",
        "touch"
    ]

    necessaryTools.forEach((tool) => {
        if(!shell.which(tool)) throw new Error(`${tool} is not installed`)
    })
}

async function deleteOldBackups(){
    const results = await bucket.getFiles()

    const files = results[0];
    files.forEach(async (file) => {
        const fileName = file.name

        const timestamp = new Date().getTime()
        const fileTimestamp = ((fileName.split(".zip")[0]).split("-"))[2]
        const fileAge = Math.floor((timestamp - fileTimestamp) / 86400000)
        
        if(fileAge >= 5){
            await file.delete()
        }
    });
}

export { getWorldName, verifyNecessaryToolsInstaled, deleteOldBackups }