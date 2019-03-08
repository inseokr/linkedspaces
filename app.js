var express        = require("express"),
	  app            = express(),
	  bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    flash          = require("connect-flash"),
    passport       = require("passport"),
    LocalStrategy  = require("passport-local"),
    methodOverride = require("method-override"),
    User           = require("./models/user")

// routes
var indexRoutes    = require("./routes/index");
var listingRoutes  = require("./routes/listing/index");
var landlordRoutes = require("./routes/listing/landlord/index");
var tennantRoutes  = require("./routes/listing/tennant/index");
var fs             = require("fs");

var fileUpload     = require('express-fileupload'); 

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
app.use("/listing", listingRoutes);
app.use("/listing/landlord", landlordRoutes);
app.use("/listing/tennant", tennantRoutes);

app.use(fileUpload());


// ISEO: req.files were undefined if it's used in routers.
// We need to address this problem later, but I will define it inside app.js for now.
app.post('/listing/landlord/file_upload', function(req, res) {

  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.file_name;
  let picIndex = req.body.pic_index;
  console.log("ISEO: Picture index = " + picIndex);

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(`./public/user_resources/pictures/_${picIndex}.jpg`, function(err) {
    if (err)
      return res.status(500).send(err);

    console.log("ISEO: Successful File upload")

    res.send('File uploaded!');
  });
});

app.post('/listing/landlord/file_delete', function(req, res) {
  console.log("ISEO: file_delete called with pic_index=" + req.body.pic_index);
  var picIndex = req.body.pic_index;
  const file_path = `./public/user_resources/pictures/_${picIndex}.jpg`;

  try {
    fs.unlinkSync(file_path);
    
  }  catch(err){
    console.error(err);
  }
  

});


app.listen(process.env.PORT, process.env.IP, function(){
//app.listen(5000, "10.0.0.194", function(){
   console.log("Linkedspaces Has Started!" + "PORT = " + process.env.PORT + " IP = " + process.env.IP);
});