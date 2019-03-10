var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../../models/user");
var RentalRequest = require("../../models/listing/tennant_request");
var node = require("deasync");

node.loop = node.runLoopOnce;


router.get("/", function(req,res){
	res.render("listing_main");
});

router.post("/", function(req, res){

    if(req.body.post_type=="landlord")
    {
        res.render("listing/landlord/new");
        
    } else 
    {
    	res.render("listing/tennant/new");
    }
});

module.exports = router;