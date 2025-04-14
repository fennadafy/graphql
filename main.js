
const token = localStorage.getItem("mytoken");

if (!token){
   loginTemplate()
}else{
    displayProfile()
}


async function decod(username , password) {
    try {
        const response = await fetch("https://learn.zone01oujda.ma/api/auth/signin", {
            method: "POST",
            headers: {
                "Authorization": "Basic "+ btoa(username + ":" + password)
            }
        })
        if (!response.ok) {
            throw (await response.json());
        }
        localStorage.setItem("mytoken", await response.json());
        displayProfile()
    return 
    } catch (error) {       
        displayerror(error.error)
        //console.error(error.error);
    }
}


function displayerror(msgerror){
    const errormsg = document.querySelector(".error-msg")
    errormsg.textContent = msgerror
}

function displayProfile(){
    document.body.innerHTML = `
     <nav class="navbar">
        <button class="logout-btn">Logout</button>
    </nav>
    <div class="container">
        <div class="profile-header">
        </div>
        <div class="userdata">

        </div>
        <div class="totalXP">

        </div>
        <div class="auditRatio">

        </div>
        <div class="skills">

        </div>
        <div class="xpProgress">

        </div>

    </div>
    <footer class="footer">
        <p class="copyright">Made with 🤍🤎 by <a href="https://github.com/fennadafy">fennadafy</a></p>
    </footer >`
    const logoutbtn = document.body.querySelector('.logout-btn')
    logoutbtn.addEventListener("click",function(){
        localStorage.removeItem("mytoken");
        loginTemplate()

    })
}

function loginTemplate(){
    document.body.innerHTML = `
    <div class="container">
    <div class="login-container">
        <div class="login-header">
            <h2>Login</h2>
        </div>
        <form>
            <div class="input-div">
                <label for="username">Email or Username</label>
                <input class="input username" type="text">
            </div>
            <div class="input-div">
                <label for="password">Password</label>
                <input class="input password" type="password">
            </div>
            <div class="error-msg"></div>
            <button type="submit" class="login-button">Log In</button>
        </form>
    </div>
</div>`
const submatbutton = document.querySelector(".login-button")
// console.log(submatbutton);
submatbutton.addEventListener("click", function (event) {
    // console.lotokeng("rrrr");
    event.preventDefault()
    const username = document.querySelector(".username").value
    // console.log(username.value);
    const password = document.querySelector(".password").value
    // console.log(password.value);
    decod(username , password)
})
}

