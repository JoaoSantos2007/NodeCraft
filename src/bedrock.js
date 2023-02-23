import dotenv from "dotenv"
dotenv.config()
import BredockServer from "./bedrockServer/BredockServer.js"

const bedrock = new BredockServer(process.env.SERVER_PATH, process.env.WORLD_NAME)

export default bedrock