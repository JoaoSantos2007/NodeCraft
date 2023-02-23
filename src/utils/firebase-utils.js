import admin from "firebase-admin";
import path from "path";
import {readFileSync} from "fs"

const serviceAccount = JSON.parse(readFileSync(path.resolve("src/utils/serviceAccountKey.json")))

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'minecraft-dev-2d21a.appspot.com'
});

const db = admin.firestore()
const bucket = admin.storage().bucket()

bucket.addLifecycleRule({
    action: "delete",
    condition: {
      age: 5, // idade em dias
      matchesStorageClass: ['STANDARD'],
    }
})
    .then(() => {
        console.log('Ciclo de vida definido com sucesso!');
    })
    .catch((err) => {
        console.error(`Erro ao definir ciclo de vida! ${err}`)
    })

export {admin, db, bucket}