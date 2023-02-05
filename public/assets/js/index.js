import { login, onUser } from "./authentication.js";
import "./jquery.js"

$(".login__google__btn").on("click", () => {
    login("google")
})

$(".login__microsoft__btn").on("click", () => {
    login("microsoft")
})

onUser(() => {
    const url = (window.location.href).replace("index.html", "")
    window.location.assign(url+"gamertag.html")
})