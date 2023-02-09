import shell from "shelljs"
import World from "./World.js"
import dotenv from "dotenv"
dotenv.config()

function initBedrockServer(){
    const bedrockPath = process.env.SERVER_PATH
    console.log(bedrockPath)
    
    shell.cd(bedrockPath)
    const terminal = shell.exec("./bedrock_server", {async:true, silent:false})
    const world = new World(terminal, bedrockPath)

    return world
}

export {initBedrockServer}