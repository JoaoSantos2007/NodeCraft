import express from "express"
import bedrock from "./src/bedrock.js"
import dotenv from "dotenv"
dotenv.config()

const app = express()
const port = process.env.SERVER_PORT

app.listen(port, () => {
    console.log(`Control server is running on port ${port}`)
})
bedrock.setup()