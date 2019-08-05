const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const app = express();

let sessionOptions = session({
	secret: "a;lskdfja;lsdkfj;sakljf",
	store: new MongoStore({ db: require("./db") }),
	resave: false,
	saveUninitialized: false,
	cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }
});

app.use(sessionOptions);

const router = require("./router");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static("public"));

app.set("views", "views");
app.set("view engine", "ejs");

app.use("/", router);

// export the app to be used in the mongodb connection file
module.exports = app;
