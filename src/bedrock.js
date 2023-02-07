import shell from "shelljs"
import World from "./World.js"

function initBedrockServer(){
    shell.cd("bedrock")
    const terminal = shell.exec("./bedrock_server", {async:true, silent:false})
    const world = new World(terminal, "../bedrock")

    return world
}

export {initBedrockServer}