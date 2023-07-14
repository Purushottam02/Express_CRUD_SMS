var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const studentsRouter = require("./routes/students");

const mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/students", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Server..."))
  .catch((err) => console.error("Error occured connecting to MongoDB...", err));

var app = express();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
const authenticate = (req, res, next) => {
  if (req.query["X-User"] === "admin") {
    next();
  } else {
    // res.send(401, 'unathorized request');
    next();
  }
};
app.use(authenticate);

var cors = require("cors");
app.use(cors());
// to change your ports for different cors stuff:
app.set("port", process.env.PORT || 8080);
app.listen(app.get("port"), function () {
  console.log("we are listening on: ", app.get("port"));
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/students", studentsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
