const express = require("express");
const session = require("express-session");
const path = require("path");
const passport = require("passport");
const port = process.env.PORT || 8000;

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



app.listen(port, async () => {
  console.log(`🚀 Server has started on port ${port}`);
});