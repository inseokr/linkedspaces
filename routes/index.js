var express = require("express");
var app     = express();
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var fileUpload = require('express-fileupload');

router.get("/", function(req, res){
	res.render("landing");
});

router.get("/facebook_login", function(req, res){
    res.render("facebook_login");
});

// show sign-up form
router.get("/signup", function(req, res){
	res.render("signup");
})


//handle sign up logic
router.post("/signup", function(req, res){

	var birthdayString = req.body.year+"-"+req.body.month+"-"+req.body.day;

	var newUser = new User({
    						username: req.body.username,
    						firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            email: req.body.email,
                            gender: req.body.gender,
                            birthdate: new Date(birthdayString)
                            });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.render("signup");
        }
        // how to use facebook login?
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome to LinkedSpaces " + user.username);
           res.redirect("/"); 
        });
    });
});

//hanle log-out 
router.get("/logout", function(req,res){
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/");
});

//show login form
router.get("/login", function(req, res){
   res.render("login"); 
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/homepage",
        failureRedirect: "/"
    }), function(req, res){
});

router.get("/homepage", function(req,res){
	res.render("homepage");
});

module.exports = router;