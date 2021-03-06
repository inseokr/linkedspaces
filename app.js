// testing heroku...
var express          = require("express"),
	  app              = express(),
	  bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    flash            = require("connect-flash"),
    passport         = require("passport"),
    LocalStrategy    = require("passport-local"),
    FacebookStrategy = require("passport-facebook").Strategy,
    methodOverride   = require("method-override"),
    User             = require("./models/user")

// routes
var indexRoutes      = require("./routes/index");
var listingRoutes    = require("./routes/listing/index");
var mynetworkRoutes  = require("./routes/mynetwork/index");
var landlordRoutes   = require("./routes/listing/landlord/index")(app);
var tenantRoutes     = require("./routes/listing/tenant/index")(app);
var profileRoutes    = require("./routes/profile/index");
var fs               = require("fs");
var path             = require("path");

var LandlordRequest  = require("./models/listing/landlord_request");
var TenantRequest  = require("./models/listing/tenant_request");


var fileUpload       = require('express-fileupload'); 

var facebook         = require('./facebook.js');

var nodemailer = require('nodemailer');

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

passport.use(new FacebookStrategy({
    clientID: '1011405085718313',
    clientSecret: '3b630313a8a2c8983405b55c11289e8b',
    callbackURL: "http://localhost:5000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {

    console.log("Facebook Login Completed. ID="+profile.id);

    facebook.getFbData(accessToken, `/${profile.id}`,"friends,email,name",  
        function(response) {
          console.log(response);
    });

    // Login completed... but how I could redirect the page??
    User.findOne({username:'inseo'}, function(err, user) {
      if (err) { return done(err); }
      console.log("Facebook login: saving current user");
      app.locals.curr_user = user;
      done(null, user);
    });
  }
));

// iseo: It's kind of pre-processing or middleware for route handling
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/listing", listingRoutes);
app.use("/mynetwork", mynetworkRoutes);
app.use("/listing/landlord", landlordRoutes);
app.use("/listing/tenant", tenantRoutes);
app.use("/profile", profileRoutes);

app.use(fileUpload());

app.locals.profile_picture = "/public/user_resources/pictures/profile_pictures/default_profile.jpg";

global.__basedir = __dirname;

// ISEO-TBD: test e-mail
/*
// TBD: test email
// <note> we should enable "Less secure app access"
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'inseo.kr@gmail.com',
    pass: '!newintern0320'
  }
});

var mailOptions = {
  from: 'inseo.kr@gmail.com',
  to: 'in.seo@spirent.com',
  subject: 'Sending Email using Node.js',
  text: '<script type="application/ld+json">
{
  "@context": "http://schema.org",
  "@type": "EmailMessage",
  "potentialAction": {
    "@type": "ConfirmAction",
    "name": "Approve Expense",
    "handler": {
      "@type": "HttpActionHandler",
      "url": "https://myexpenses.com/approve?expenseId=abc123"
    }
  },
  "description": "Approval request for John's $10.13 expense for office supplies"
}
</script>'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});*/

app.get('/drag_drop', function(req, res){
res.render("drag_drop_demo_v1");

});



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
    let picPath = "/public/user_resources/pictures/landlord/"+list_id+"_"+picIndex+"_"+sampleFile.name;

    console.log("picPath=" + picPath);

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv("."+picPath, function(err) {
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
      const picPath = "/public/user_resources/pictures/landdlord/"+req.params.list_id+"_"+picIndex+".jpg";

      fs.unlinkSync("."+picPath);
      foundListing.pictures[picIndex-1].path = "";
      foundListing.num_of_pictures_uploaded = foundListing.num_of_pictures_uploaded - 1;
      foundListing.save();
    }  catch(err){
      console.error(err);
    }
  });

});


// File operation for tenant

// ISEO: req.files were undefined if it's used in routers.
// We need to address this problem later, but I will define it inside app.js for now.
app.post('/listing/tenant/:list_id/file_upload', function(req, res) {

  console.log("file upload: listing_id: " + req.params.list_id);

  TenantRequest.findById(req.params.list_id, function(err, foundListing){
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }

    console.log("Found listing. listing_id=" + req.params.list_id);

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.file_name;
    let list_id = req.params.list_id;
    let picPath = "/public/user_resources/pictures/tenant/"+list_id+"_"+sampleFile.name;

    console.log("picPath=" + picPath);

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv("."+picPath, function(err) {
      if (err)
      {
        console.log("mv operation failed with error code="+err);
        return res.status(500).send(err);
      }

      console.log("ISEO: Successful File upload");
      var picture = {path: picPath, caption: req.body.caption};

      // We will allow only 1 photo for now, and the same array entry will be used.
      if(foundListing.profile_pictures.length==0)
      {
        foundListing.profile_pictures.push(picture);
      } 
      else
      {
        foundListing.profile_pictures[0] = picture;
      }

      foundListing.num_of_profile_picture_uploaded =  foundListing.num_of_profile_picture_uploaded + 1;
      foundListing.save();

      res.send('File uploaded!');
    });
  });

});

app.post('/listing/tenant/:list_id/file_delete', function(req, res) {
  console.log("tenant, file_delete is called");

  TenantRequest.findById(req.params.list_id, function(err, foundListing){
    try {
      
      console.log("File path=" + foundListing.profile_pictures[0].path );
      fs.unlinkSync("." + foundListing.profile_pictures[0].path);
      
      foundListing.profile_pictures[0].path = "";
      foundListing.num_of_profile_picture_uploaded = foundListing.num_of_profile_picture_uploaded - 1;
      foundListing.save();

      res.send('File Deleted!');

    }  catch(err){
      console.error(err);
    }
  });

});



// file operation for profile
// ISEO: req.files were undefined if it's used in routers.
// We need to address this problem later, but I will define it inside app.js for now.
app.post('/profile/:user_id/file_upload', function(req, res) {

  console.log("file upload: user_id: " + req.params.user_id);

  User.findById(req.params.user_id, function(err, curr_user){
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }


    console.log("ISEO: uploading profile picture...");

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.file_name;
    let user_id = req.params.user_id;
    // ISEO-TBD: Wow... what is it?
    let picPath = "/public/user_resources/pictures/"+user_id+"_"+"profile"+"."+sampleFile.name.split(".")[1];

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv("."+picPath, function(err) {
      if (err)
      {
        console.log("ISEO: upload failure. error="+err);
        return res.status(500).send(err);
      }

      console.log("ISEO: Successful File upload");

      curr_user.profile_picture = picPath;

      app.locals.profile_picture = picPath;

      curr_user.save();

      res.send('File uploaded!');
    });
  });

});

app.post('/profile/:user_id/file_delete', function(req, res) {

  User.findById(req.params.user_id, function(err, curr_user){
    try {
      fs.unlinkSync("."+curr_user.profile_picture);

      curr_user.profile_picture = "";

      curr_user.save();
    }  catch(err){
      console.error(err);
    }
  });

});



app.get("/public/user_resources/pictures/:filename", function(req, res){
  var fileName = req.params.filename;
  console.log("picture: received file name=" + fileName)
    res.sendFile(path.join(__dirname, `/public/user_resources/pictures/${fileName}`));
});

app.get("/public/user_resources/pictures/landlord/:filename", function(req, res){
  var fileName = req.params.filename;
  console.log("picture: received file name=" + fileName)
    res.sendFile(path.join(__dirname, `/public/user_resources/pictures/landlord/${fileName}`));
});

app.get("/public/user_resources/pictures/profile_pictures/:filename", function(req, res){
  var fileName = req.params.filename;
  console.log("Profile picture: received file name=" + fileName)
    res.sendFile(path.join(__dirname, `/public/user_resources/pictures/profile_pictures/${fileName}`));
});


app.get("/public/user_resources/pictures/tenant/:filename", function(req, res){
  var fileName = req.params.filename;
  console.log("picture: received file name=" + fileName)
    res.sendFile(path.join(__dirname, `/public/user_resources/pictures/tenant/${fileName}`));
});


app.get("/scripts/:filename", function(req, res){
  var fileName = req.params.filename;
  console.log("script: received file name=" + fileName)
    res.sendFile(path.join(__dirname, `/scripts/${fileName}`));
});


app.listen(process.env.PORT, process.env.IP, function(){
//app.listen(5000, "10.0.0.194", function(){
   console.log("Linkedspaces Has Started!" + "PORT = " + process.env.PORT + " IP = " + process.env.IP);
});

//Facebook login
// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook', 
  {
        successRedirect: "/listing",
        failureRedirect: "/login"
      }), function(req,res){
      console.log("This callback is not expected, auth/facebook/callback will be called instead");
});

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/listing',
                                      failureRedirect: '/login' }));