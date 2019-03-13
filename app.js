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
var path           = require("path");

var LandlordRequest = require("./models/listing/landlord_request");

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
app.post('/listing/landlord/:list_id/file_upload', function(req, res) {

  console.log("file upload: listing_id: " + req.params.list_id);

  LandlordRequest.findById(req.params.list_id, function(err, foundListing){
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }

    console.log("Found listing. listing_id=" + req.params.list_id);

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.file_name;
    let picIndex = req.body.pic_index;
    let list_id = req.params.list_id;
    let picPath = "./public/user_resources/pictures/"+list_id+"_"+picIndex+".jpg";

    console.log("picPath=" + picPath);

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(picPath, function(err) {
      if (err)
        return res.status(500).send(err);

      console.log("ISEO: Successful File upload");
      var picture = {path: picPath, caption: req.body.caption};

      // check if entry exists already
      if(picIndex>foundListing.pictures.length)
      {
        foundListing.pictures.push(picture);
      }
      else
      {
        foundListing.pictures[picIndex-1] = picture;
      }

      foundListing.num_of_pictures_uploaded =  foundListing.num_of_pictures_uploaded + 1;
      foundListing.save();

      res.send('File uploaded!');
    });
  });

});

app.post('/listing/landlord/:list_id/file_delete', function(req, res) {
  console.log("ISEO: file_delete called with pic_index=" + req.body.pic_index);
  var picIndex = req.body.pic_index;

  LandlordRequest.findById(req.params.list_id, function(err, foundListing){
    try {
      const picPath = "./public/user_resources/pictures/"+req.params.list_id+"_"+picIndex+".jpg";

      fs.unlinkSync(picPath);
      foundListing.pictures[picIndex-1].path = "";
      foundListing.num_of_pictures_uploaded = foundListing.num_of_pictures_uploaded - 1;
      foundListing.save();
    }  catch(err){
      console.error(err);
    }
  });

});


app.get("/public/user_resources/pictures/:filename", function(req, res){
  var fileName = req.params.filename;
  console.log("received file name=" + fileName)
    res.sendFile(path.join(__dirname, `/public/user_resources/pictures/${fileName}`));
});



app.listen(process.env.PORT, process.env.IP, function(){
//app.listen(5000, "10.0.0.194", function(){
   console.log("Linkedspaces Has Started!" + "PORT = " + process.env.PORT + " IP = " + process.env.IP);
});