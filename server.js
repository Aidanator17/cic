const express = require("express");
const session = require("express-session");
const path = require("path");
const passport = require("passport");
const port = process.env.PORT || 8000;
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

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
// Middleware for express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// app.use((req, res, next) => {
//   console.log(`User details are: `);
//   console.log(req.user);

//   console.log("Entire session object:");
//   console.log(req.session);

//   console.log(`Session details are: `);
//   console.log(req.session.passport);
//   next();
// });

app.get("/", async (req, res) => {
  res.render("index")
})

app.post("/", async (req, res) => {

  function getOutput() {
    let today = String((new Date()).getFullYear()) + "-" + String((new Date()).getMonth() + 1) + "-" + String((new Date()).getDate())
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
  console.log(output)
  // async function getUsers() {
  //   try {
  //     const users = await prisma.user.findMany()
  //     return users
  //   } catch (err) {
  //     console.log("Something went wrong",err)
  //   }
  // }
  // let allusers = await getUsers()

  // let f = JSON.stringify(output)
  // console.log(f)
  // allusers[0].cic.push(f)
  // console.log(allusers[0].cic)


  // const updateUser = await prisma.user.update({
  //   where: {
  //     email: "aidan.r.christopher@gmail.com",
  //   },
  //   data: {
  //     cic: allusers[0].cic,
  //   },
  // })

  res.redirect('/')

})


app.listen(port, async () => {
  console.log(`🚀 Server has started on port ${port}`);
});