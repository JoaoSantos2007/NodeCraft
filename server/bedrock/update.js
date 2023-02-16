import shell from "shelljs"
import path from "path"


function update(bedrockPath){
    if(!shell.exec("ls -d */", {silent: true}).stdout.includes("tmp")) shell.mkdir("tmp")
    const tmp = path.resolve("tmp")

    shell.exec(`curl -L ${BASE_URL} 2>/dev/null| grep bin-linux | sed -e 's/.*<a href=\"\(https:.*\/bin-linux\/.*\.zip\).*/\1/'`)
}

export default update