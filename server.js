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
  let values
  if (req.query.yes==undefined) {
    values = {
      yes:0,
      no:0,
      np:0
    }
  }
  else {
    values = {
      yes:req.query.yes,
      no:req.query.no,
      np:req.query.np
    }
  }
  res.render("index", {values:values})
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
    let today = String(date.getFullYear()) + "-" + String(date.getMonth() + 1) + "-" + String(date.getDate())
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

  res.render("rundown", { cic: allusers[0].cic })
})

app.post("/suspensions", async (req, res) => {
  let today = new Date()
  let todaystring = String(today.getFullYear())+"-"+String(today.getMonth()+1)+"-"+String(today.getDate())


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
      // console.log(susp)
      return susp
    } catch (err) {
      console.log("Something went wrong", err)
    }
  }
  let susplist = await getSusp()

  res.render("suspensions", {list:susplist})
  
})

app.get("/retrieve/:id", async (req, res) => {
  async function findSusp() {
    try {
      const susp = await prisma.sus.findUnique({
        where: {
          id:req.params.id
        }
      })
      // console.log(susp)
      return susp
    } catch (err) {
      console.log("Something went wrong", err)
    }
  }
  let susp = await findSusp()
  // console.log(susp)
  res.redirect("/?yes="+susp.yes+"&no="+susp.no+"&np="+susp.np)

})

app.get("/susdelete/:id", async (req, res) => {
  const deleteSus = await prisma.sus.delete({
    where: {
      id: req.params.id,
    },
  })
  res.redirect("/suspensions")
})

app.listen(port, async () => {
  console.log(`🚀 Server has started on port ${port}`);
});