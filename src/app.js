import express from "express"
import { initBedrockServer } from "./bedrock.js"

const app = express()

app.use("/", express.static("../public"))
const world = initBedrockServer()

export default app