import dotenv from "dotenv"
import app from "./src/app.js"
import bedrock from "./src/bedrock.js"
dotenv.config()

const port = process.env.SERVER_PORT

app.listen(port, () => {
    console.log(`Control server is running on port ${port}`)
})
bedrock.setup()