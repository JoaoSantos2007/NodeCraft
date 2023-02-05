import {onUser, auth} from "./authentication.js"
import { getUserTemplateOnChange, pushUserToAcceptList, removeUserFromAcceptList, verifyUserTemplate } from "./database.js"
import "./jquery.js"

async function renderPlayerAcceptList(player){
    const playerAcceptList = player.accept
    const playerAcceptListElement = $(".players__main__list")
    playerAcceptListElement.empty()
    

    playerAcceptList.forEach(gamertag => {
        const p = $("<p>").addClass("players__main__list__player__gamertag").text(gamertag)
        const img = $("<img>").addClass("players__main__list__player__delete").attr("src","assets/img/delete.svg")

        img.on("click", () => {
            const user = auth.currentUser
            removeUserFromAcceptList(gamertag, user)
        })

        const li = $("<li>").addClass("players__main__list__player")
        li.append(p)
        li.append(img)
        playerAcceptListElement.append(li)
    });
}

$(".players__footer__add__gamertag").on("click", () => {
    const inputGamertag = $(".players__footer__input__gamertag")
    const gamertag = inputGamertag.val()
    inputGamertag.val("")

    const user = auth.currentUser
    pushUserToAcceptList(gamertag, user)
})

onUser(async (user) => {
    await verifyUserTemplate()

    getUserTemplateOnChange(user, (userData) => {
        renderPlayerAcceptList(userData)
    })
})