import {login, auth} from "./authentication.js"
import { verifyUserTemplate } from "./database.js"
import "./jquery.js"

$(".setUser").on("submit",async (event) => {
    event.preventDefault()

    const user = auth.currentUser
    if(!user) return login
    await verifyUserTemplate(user)

    const gamertag = $(".setUser__gamertag").val()
})