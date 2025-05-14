
async function start() {
    const token = localStorage.getItem("mytoken");
    if (!token) {
        loginTemplate()
    } else {
        console.log(token);
        const userdata = await getdata(token)
        // console.log("rrr",userdata);
        if (userdata){
            displayProfile(userdata)
        }
    }
}

addEventListener("DOMContentLoaded", () => start())

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
            body: JSON.stringify({ query })
        })
        if (!response.ok) {
            throw await response.json()
        }
        const res = await response.json()
        return prepareData(res)
    } catch (error) {
        console.log(error);
    }
}


function prepareData(data) {
    console.log("data : ",data);
    if (data.data.progress.length == 0) {
        return;
    }
    let userdata

    const progressObject = {}

    data.data.progress.forEach(progress => {
        progressObject[progress.object.name] = progress.amount
    })

    userdata = {
        "firstName": data.data.user[0].firstName,
        "lastName": data.data.user[0].lastName,
        "login": data.data.user[0].login,
        "email": data.data.user[0].email,
        "campus": data.data.user[0].campus,
        "auditRatio": (data.data.user[0].auditRatio).toFixed(1),
        "Totalxp": data.data.user[0].transactions_aggregate.aggregate.sum.amount,
        "totalprogect": data.data.progress.length,
        "skills": data.data.skills,
        "progress": progressObject,
    }
    return userdata
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
        // displayProfile()
        start()
        return
    } catch (error) {
        displayerror(error.error)
    }
}


function displayerror(msgerror) {
    const errormsg = document.querySelector(".error-msg")
    if (errormsg) {
        errormsg.textContent = msgerror
    }
}

//TODO
//clear css 
//stayle 
//xpprogress ykon fo9 footer 
//responsive 
//read svg 
//clear code 
//good practesses 

function displayProfile(userdata) {
    document.body.innerHTML = `
     <nav class="navbar">
        <button class="logout-btn">Logout</button>
    </nav>
    <div class="container">
    
        <div class="profile-header">
        <div class="welcome">Welcome,</div>
        </div>

        <div class="userdata">
        </div>
        <div class="userdata2">
        </div>
        <div class="totalXP">
        <svg id="chart" viewBox="0 0 800 250" preserveAspectRatio="none"></svg>
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
    profileHeader(userdata)
    userInfo(userdata)
    SkillsGraph(userdata.skills)
    ProgressGraph(userdata.progress)
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

function profileHeader(userdata) {
    const div = document.createElement("div")
    div.textContent = userdata.firstName + " " + userdata.lastName
    div.className = "username"
    document.querySelector(".profile-header").appendChild(div)
}

function userInfo(userdata) {

    const userDataElem = document.querySelector(".userdata")
    const login = document.createElement("div")
    login.className = "login"
    login.textContent = "Login: " + userdata.login
    userDataElem.append(login)

    const email = document.createElement("div")
    email.className = "email"
    email.textContent = "Email: " + userdata.email
    userDataElem.append(email)

    const campus = document.createElement("div")
    campus.className = "campus"
    campus.textContent = "Campus: " + userdata.campus
    userDataElem.append(campus)
const userDataElem2 = document.querySelector(".userdata2")
    const auditRatio = document.createElement("div")
    auditRatio.className = "auditRatio"
    auditRatio.textContent = "AuditRatio: " + userdata.auditRatio
    userDataElem2.append(auditRatio)

    const TotalXP = document.createElement("div")
    TotalXP.className = "TotalXP"
    if (userdata.Totalxp /1000){
        console.log('ooo', userdata.Totalxp /1000);
    }
    TotalXP.textContent = "TotalXp: " + (((userdata.Totalxp)/1000) < 1000 ? ((userdata.Totalxp)/1000).toFixed(0) +"kB" : ((((userdata.Totalxp/1000))/1000).toFixed(2) +"mB"));
    userDataElem2.append(TotalXP)

    const TotalProjectValid = document.createElement("div")
    TotalProjectValid.className = "ProjectValid"
    TotalProjectValid.textContent = "Total Project Valid: " + userdata.totalprogect
    userDataElem2.append(TotalProjectValid)

}

function SkillsGraph(skills) {

    const svg = document.getElementById("chart");
    const barWidth = 30;
    const spacing = 10;
    const paddingLeft = 50;
    const paddingBottom = 40;
    const paddingTop = 20;
    const paddingRight = 20;
    const chartHeight = 200;
    const chartWidth = skills.length * (barWidth + spacing);

    const maxPoints = 70; // Rounded for better Y-axis scaling

    // Draw Y-axis ticks and labels
    for (let i = 0; i <= maxPoints; i += 10) {
        const y = paddingTop + chartHeight - (i / maxPoints) * chartHeight;

        // Tick line
        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        tick.setAttribute("x1", paddingLeft - 5);
        tick.setAttribute("x2", paddingLeft);
        tick.setAttribute("y1", y);
        tick.setAttribute("y2", y);
        tick.setAttribute("class", "tick");
        svg.appendChild(tick);

        // Label
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", paddingLeft - 10);
        label.setAttribute("y", y + 4);
        label.setAttribute("text-anchor", "end");
        label.setAttribute("class", "axis-label");
        label.textContent = i + " %";
        svg.appendChild(label);
    }

    // Y-axis line
    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", paddingLeft);
    yAxis.setAttribute("x2", paddingLeft);
    yAxis.setAttribute("y1", paddingTop);
    yAxis.setAttribute("y2", paddingTop + chartHeight);
    yAxis.setAttribute("stroke", "#000");
    yAxis.setAttribute("stroke-width", 1.5);
    svg.appendChild(yAxis);

    // X-axis line
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", paddingLeft);
    xAxis.setAttribute("x2", paddingLeft + chartWidth);
    xAxis.setAttribute("y1", paddingTop + chartHeight);
    xAxis.setAttribute("y2", paddingTop + chartHeight);
    xAxis.setAttribute("stroke", "#000");
    xAxis.setAttribute("stroke-width", 1.5);
    svg.appendChild(xAxis);

    // Tooltip elements (invisible by default)
    const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "text");
    tooltip.setAttribute("class", "tooltip");
    tooltip.setAttribute("visibility", "hidden");
    svg.appendChild(tooltip);

    const hoverLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    hoverLine.setAttribute("class", "hover-line");
    hoverLine.setAttribute("visibility", "hidden");
    svg.appendChild(hoverLine);

    // Bars and X-axis labels
    skills.forEach((skill, index) => {
        const height = (skill.amount / maxPoints) * chartHeight;
        const x = paddingLeft + index * (barWidth + spacing);
        const y = paddingTop + chartHeight - height;

        // Bar
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", barWidth);
        rect.setAttribute("height", height);
        rect.setAttribute("fill", "#69b3a2");
        svg.appendChild(rect);

        // Label
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", x + barWidth / 2);
        label.setAttribute("y", paddingTop + chartHeight + 12);
        label.setAttribute("class", "label");
        console.log("eeeeeeeeee", skill.type);

        label.textContent = skill.type.slice(6);
        svg.appendChild(label);

        // Hover event listeners
        rect.addEventListener("mouseenter", function () {
            tooltip.setAttribute("x", x + barWidth / 2);
            tooltip.setAttribute("y", y - 10);
            tooltip.setAttribute("visibility", "visible");
            tooltip.textContent = skill.amount;

            hoverLine.setAttribute("x1", x + barWidth / 2);
            hoverLine.setAttribute("y1", paddingTop);
            hoverLine.setAttribute("x2", x + barWidth / 2);
            hoverLine.setAttribute("y2", y);
            hoverLine.setAttribute("visibility", "visible");
        });
        rect.addEventListener("mouseleave", function () {
            tooltip.setAttribute("visibility", "hidden");
            hoverLine.setAttribute("visibility", "hidden");
        });
    });

}

function ProgressGraph(progress) {
    console.log("progress=>", progress);
    const labels = Object.keys(progress);
    const values = Object.values(progress);

    const width = 1000;
    const height = 530;
    const padding = 60;
    // <svg id="chart" viewBox="0 0 800 250" preserveAspectRatio="none"></svg>

    const maxValue = Math.max(...values);

    // Create SVG element
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 1000 650");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("id", "ProgressGraph")

    // Scale functions  
    const xStep = (width - 2 * padding) / (labels.length - 1);
    const scaleY = val => height - padding - (val / maxValue) * (height - 2 * padding);

    const points = [];

    labels.forEach((label, i) => {
        const x = padding + i * xStep;
        const y = scaleY(progress[label]);
        points.push({ x, y, label });

        // Draw circle
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", 4);
        circle.setAttribute("fill", "blue");
        svg.appendChild(circle);

        const tooltip = document.createElementNS(svgNS, "text");
        tooltip.setAttribute("visibility", "hidden");
        tooltip.setAttribute("font-size", "15");
        tooltip.setAttribute("fill", "black");
        tooltip.setAttribute("text-anchor", "middle");
        svg.appendChild(tooltip);

        circle.addEventListener("mouseenter", () => {
            tooltip.setAttribute("x", x);
            tooltip.setAttribute("y", y - 10);
            tooltip.textContent = `${progress[label]} XP`;
            tooltip.setAttribute("visibility", "visible");
        });

        circle.addEventListener("mouseleave", () => {
            tooltip.setAttribute("visibility", "hidden");
        });

        // Label
        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", x);
        text.setAttribute("y", height - padding + 15);
        text.setAttribute("font-size", "12");
        text.setAttribute("text-anchor", "end");
        text.setAttribute("transform", `rotate(-45 ${x},${height - padding + 15})`);
        text.textContent = label;
        svg.appendChild(text);
        svg.appendChild(text);
    });

    // Draw lines between points
    for (let i = 0; i < points.length - 1; i++) {
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", points[i].x);
        line.setAttribute("y1", points[i].y);
        line.setAttribute("x2", points[i + 1].x);
        line.setAttribute("y2", points[i + 1].y);
        line.setAttribute("stroke", "blue");
        line.setAttribute("stroke-width", "2");
        svg.appendChild(line);
    }

    // Draw axes
    const xAxis = document.createElementNS(svgNS, "line");
    xAxis.setAttribute("x1", padding);
    xAxis.setAttribute("y1", height - padding);
    xAxis.setAttribute("x2", width - padding); 
    xAxis.setAttribute("y2", height - padding);
    xAxis.setAttribute("stroke", "#000");
    svg.appendChild(xAxis);

    const yAxis = document.createElementNS(svgNS, "line");
    yAxis.setAttribute("x1", padding);
    yAxis.setAttribute("y1", padding);
    yAxis.setAttribute("x2", padding);
    yAxis.setAttribute("y2", height - padding);
    yAxis.setAttribute("stroke", "#000");
    svg.appendChild(yAxis);

    // Add Y-axis labels
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
        const val = (maxValue / steps) * i;
        const y = scaleY(val);
        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", padding - 10);
        text.setAttribute("y", y + 4);
        text.setAttribute("text-anchor", "end");
        text.setAttribute("font-size", "10");
        text.textContent = val;
        svg.appendChild(text);

        // Grid line
        const grid = document.createElementNS(svgNS, "line");
        grid.setAttribute("x1", padding);
        grid.setAttribute("y1", y);
        grid.setAttribute("x2", width - padding);
        grid.setAttribute("y2", y);
        grid.setAttribute("stroke", "#ccc");
        grid.setAttribute("stroke-dasharray", "2,2");
        svg.appendChild(grid);


    }
    document.querySelector(".xpProgress").appendChild(svg);
}