import properties from "properties-parser"
import shell from "shelljs"

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

export { getWorldName, verifyNecessaryToolsInstaled }