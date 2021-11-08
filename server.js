const express = require("express");
const session = require("express-session");
const path = require("path");
const passport = require("passport");
const port = process.env.PORT || 8000;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const { TimezoneDate } = require("timezone-date.ts");

const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", async (req, res) => {
  res.render("index")
})

app.post("/", async (req, res) => {

  function getOutput() {
    function pst() {
      let currentdate = new Date()
      let currentmonthnum = currentdate.getMonth() + 1
      let currentmonth
      if (currentmonthnum == 1) {
        currentmonth = "January"
      }
      else if (currentmonthnum == 2) {
        currentmonth = "February"
      }
      else if (currentmonthnum == 3) {
        currentmonth = "March"
      }
      else if (currentmonthnum == 4) {
        currentmonth = "April"
      }
      else if (currentmonthnum == 5) {
        currentmonth = "May"
      }
      else if (currentmonthnum == 6) {
        currentmonth = "June"
      }
      else if (currentmonthnum == 7) {
        currentmonth = "July"
      }
      else if (currentmonthnum == 8) {
        currentmonth = "August"
      }
      else if (currentmonthnum == 9) {
        currentmonth = "September"
      }
      else if (currentmonthnum == 10) {
        currentmonth = "October"
      }
      else if (currentmonthnum == 11) {
        currentmonth = "November"
      }
      else if (currentmonthnum == 12) {
        currentmonth = "December"
      }
      let currentday = currentdate.getDate()
      let currentyear = currentdate.getFullYear()
      let currenttime = currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds()
      let pststring = currentmonth + ' ' + currentday + ', ' + currentyear + ' ' + currenttime + ' GMT-07:00'
  
      let pstdate = new Date(pststring)
  
      return pstdate
  
  
    }
    let date = pst()
    let today = String(date.getFullYear()) + "-" + String(date.getMonth() + 1) + "-" + String(date.getDate()-1)
    let denom = parseInt(req.body.yes) + parseInt(req.body.no) + parseInt(req.body.np)
    if (denom == 0) {
      denom = 1
    }
    let ocic = ((req.body.yes / denom) * 100).toFixed(2)
    let diff = parseInt(req.body.yes) - parseInt(req.body.no) - parseInt(req.body.np)
    let odiff
    if (diff < 1) {
      odiff = String(diff)
    }
    else {
      odiff = "+" + String(diff)
    }

    let output = {
      date: today,
      yes: parseInt(req.body.yes),
      no: parseInt(req.body.no),
      np: parseInt(req.body.np),
      cic: String(ocic) + "%",
      diff: odiff
    }
    return output
  }
  let output = getOutput()
  async function getUsers() {
    try {
      const users = await prisma.user.findMany()
      return users
    } catch (err) {
      console.log("Something went wrong", err)
    }
  }
  let allusers = await getUsers()

  let f = JSON.stringify(output)
  console.log(f)
  allusers[0].cic.push(f)
  console.log(allusers[0].cic)


  const updateUser = await prisma.user.update({
    where: {
      email: "aidan.r.christopher@gmail.com",
    },
    data: {
      cic: allusers[0].cic,
    },
  })

  res.redirect('/')

})

app.get("/rundown", async (req, res) => {
  async function getUsers() {
    try {
      const users = await prisma.user.findMany()
      return users
    } catch (err) {
      console.log("Something went wrong", err)
    }
  }

  let allusers = await getUsers()
  console.log(allusers[0].cic.reverse())

  res.render("rundown", { cic: allusers[0].cic })
})

app.post("/suspensions", async (req, res) => {
  let today = new Date()
  let todaystring = String(today.getFullYear())+"-"+String(today.getMonth()+1)+"-"+String(today.getDate()-1)
  console.log(todaystring)
  
  const d = TimezoneDate.fromDate(new Date())
  d.timezone = -8
  console.log("!!!\n"+d.toString()+"\n!!!")


  const addSuspension = await prisma.sus.create({
    data: {
      eid:2938068,
      yes:parseInt(req.body.syes),
      no:parseInt(req.body.sno),
      np:parseInt(req.body.snp),
      date: todaystring
    },
  })

  res.redirect("/")
})

app.get("/suspensions", async (req, res) => {
  async function getSusp() {
    try {
      const susp = await prisma.sus.findMany()
      return susp
    } catch (err) {
      console.log("Something went wrong", err)
    }
  }
  console.log(getSusp())
  
})

app.listen(port, async () => {
  console.log(`🚀 Server has started on port ${port}`);
});