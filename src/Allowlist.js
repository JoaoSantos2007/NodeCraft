import fs from "fs"
import ControlEvents from "./ControlEvents.js";
import { bedrock } from "../server.js"

class Allowlist{
    static wipe(){
        fs.writeFileSync(bedrock.allowlist, JSON.stringify([]))
    }

    static reload(){
        ControlEvents.emitEvent("allowlist reload")
    }

    static read(){
        return new Promise((resolve, reject) => {
            const rawdata = fs.readFileSync(bedrock.allowlist);
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

    static allow(gamertag){
        const rawdata = fs.readFileSync(bedrock.allowlist);
        const data = JSON.parse(rawdata);

        data.push({
            "ignoresPlayerLimit": false,
            "name": gamertag
        })

        fs.writeFileSync(bedrock.allowlist, JSON.stringify(data))
    }
}

export default Allowlist