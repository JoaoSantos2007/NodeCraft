import express from "express"
import app from "./src/app.js"
import dotenv from "dotenv"
dotenv.config()

const app = express()
const port = process.env.SERVER_PORT

app.use("/", express.static("public"))

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})