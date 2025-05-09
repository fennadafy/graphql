const token = localStorage.getItem("mytoken");

if (!token) {
    loginTemplate()
} else {
    displayProfile()
    console.log(token);
    getdata(token)
}

async function getdata(token) {

const query = `{
  user {
    login
    firstName
    lastName
    auditRatio
    email : attrs(path : "email")
    campus
    transactions_aggregate(where: {eventId: {_eq: 41}, type: {_eq: "xp"}}) {
      aggregate {
        sum {
          amount
        }
      }
    }
  }
  
 skills :  transaction(
      distinct_on: type 
      where: { type: { _like: "skill_%" } }
      order_by: [{ type: asc }, { amount: desc }]
    ) {
      type
      amount
    }
  
progress : transaction (
      where: {type: {_eq: "xp"}, 
      eventId: {_eq: 41},
      object: {type: {_neq: "exercise"}, _and: {name: {_neq: "Module"}}}}
    ) {
      amount
      object {
        name
    }
  }
}
`
    try {
        const response = await fetch("https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({query})
        })
        if (!response.ok) {
            throw await response.json()
        }
        const res = await response.json()
        preperdata(res)
        return
    } catch (error) {
        console.log(error);
    }
}



async function preperdata(data) {
    
    document.querySelector(".profile-header")

    
    console.log("=============>", data.data.progress[0].object.name);


}


async function decod(username, password) {
    try {
        const response = await fetch("https://learn.zone01oujda.ma/api/auth/signin", {
            method: "POST",
            headers: {
                "Authorization": "Basic " + btoa(username + ":" + password)
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
    }
}


function displayerror(msgerror) {
    const errormsg = document.querySelector(".error-msg")
    errormsg.textContent = msgerror
}

function displayProfile() {
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
        <div class="xpProgress">

        </div>
    </div>
    <footer class="footer">
        <p class="copyright">Made with 🤍 by <a href="https://github.com/fennadafy">fennadafy</a></p>
    </footer >`
    const logoutbtn = document.body.querySelector('.logout-btn')
    logoutbtn.addEventListener("click", function () {
        localStorage.removeItem("mytoken");
        loginTemplate()
    })
}

function loginTemplate() {
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
    submatbutton.addEventListener("click", function (event) {
        event.preventDefault()
        const username = document.querySelector(".username").value
        const password = document.querySelector(".password").value
        decod(username, password)
    })
}

