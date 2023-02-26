import admin from "firebase-admin";
import path from "path";
import {readFileSync} from "fs"
import dotenv from "dotenv"
dotenv.config()

const serviceAccount = JSON.parse(readFileSync(path.resolve("./serviceAccountKey.json")))

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.STORAGE_BUCKET
});

const db = admin.firestore()
const bucket = admin.storage().bucket()

export {admin, db, bucket}