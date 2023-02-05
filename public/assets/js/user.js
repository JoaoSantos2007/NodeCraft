import {onUser, logout} from "./authentication.js"
import { getUserTemplateOnChange, verifyUserTemplate } from "./database.js"
import "./jquery.js"

function renderPlayerInfo(player){
    $(".user__email").text(player.email)
    $(".user__admin").text(player.admin)
    $(".user__gamertag").text(player.gamertag)
}

onUser(async (user) => {
    await verifyUserTemplate()

    getUserTemplateOnChange(user, (userData) => {
        renderPlayerInfo(userData)
    })
})

$(".user__logout").on("click", () => {
    logout()
})