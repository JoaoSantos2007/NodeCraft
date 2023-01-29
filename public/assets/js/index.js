import {login, auth} from "./authentication.js"
import { verifyUserTemplate } from "./database.js"
import "./jquery.js"

fetch("/assets/json/user.json")
    .then((res) => {
        res.json()
            .then((data) => {
                console.log(data)
            })
            .catch((err) => {
                console.error(err)
            })
    })
    .catch((err) => {
        console.error(err)
    })

$(".setUser").on("submit",async (event) => {
    event.preventDefault()

    const user = auth.currentUser
    if(!user) return login
    await verifyUserTemplate(user)

    const gamertag = $(".setUser__gamertag").val()
})


