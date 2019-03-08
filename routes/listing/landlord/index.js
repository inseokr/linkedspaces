var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../../../models/user");
var RentalRequest = require("../../../models/listing/rental_request");
var node = require("deasync");

node.loop = node.runLoopOnce;


router.post("/new", function(req, res){
	if(req.body.submit=="exit")
	{
		res.render("listing_main");
	}
	else 
	{
		res.render("listing/landlord/new_step2");
	}
});

// ISEO: this is just for testing
router.get("/edit", function(req,res){
	res.render("listing/landlord/new_step5");
});

router.get("/temp", function(req,res){
	res.render("listing/landlord/new_temp");
});

module.exports = router;