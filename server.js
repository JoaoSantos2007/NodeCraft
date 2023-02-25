import dotenv from "dotenv"
dotenv.config()
import BedrockServer from "./src/BedrockServer.js"

const bedrock = new BedrockServer(process.env.SERVER_PATH, process.env.WORLD_NAME)

bedrock.setup()

export { bedrock }