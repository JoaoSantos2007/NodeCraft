import shell from "shelljs"
import World from "./World.js"

function initBedrockServer(){
    shell.cd("bedrock")
    const Bedrock = shell.exec("./bedrock_server", {async:true, silent:true})
    const world = new World(Bedrock)

    return world
}

export {initBedrockServer}