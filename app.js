var express = require("express"),
	app = express(),
	bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    User        = require("./models/user")

 var indexRoutes = require("./routes/index");

var url = process.env.DATABASEURL || "mongodb://localhost/Linkedspaces";
mongoose.connect(url,  { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


var indexRoutes = require("./routes/index");
app.use(methodOverride("_method"));
app.use(flash());


// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // iseo: passport will use User's authenticate method which is passport-mongoose-local
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// iseo: It's kind of pre-processing or middleware for route handling
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});


app.use("/", indexRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
//app.listen(5000, "10.0.0.194", function(){
   console.log("Linkedspaces Has Started!" + "PORT = " + process.env.PORT + " IP = " + process.env.IP);
});