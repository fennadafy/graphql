const submatbutton = document.querySelector(".login-button")
// console.log(submatbutton);
submatbutton.addEventListener("click", function (event) {
    // console.log("rrrr");
    event.preventDefault()
    const username = document.querySelector(".username")
    // console.log(username.value);
    const password = document.querySelector(".password")
    // console.log(password.value);
    decod(username , password)
})

async function decod(username , password) {
    let headers = new Headers()
    headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));
    try {
        const response = await fetch("https://learn.zone01oujda.ma/api/auth/signin", {
            method: "POST",
            headers: {
                headers
            }
        })
        if (!response.ok) {
            throw new Error(`${response.status}`);
        }
        const json = await response.json();
        console.log(json);
    } catch {        
        // console.error(error.message);
    }
}