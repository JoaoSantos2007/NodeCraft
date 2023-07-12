import app from "./src/app.js"
import dotenv from "dotenv"
dotenv.config()
import admin from "firebase-admin";
import path from "path";
import {readFileSync} from "fs"

const serviceAccount = JSON.parse(readFileSync(path.resolve("./serviceAccountKey.json")))

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "minecraft-dev-2d21a.appspot.com"
});

const db = admin.firestore()
const bucket = admin.storage().bucket()

console.log(await bucket.getFiles())

//import BedrockServer from "./src/bedrock/BedrockServer.js"
//const bedrock = new BedrockServer(process.env.SERVER_PATH)
//bedrock.setup()
//export { bedrock }

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running in port ${PORT}`)
})