var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../../../models/user");
var LandlordRequest = require("../../../models/listing/landlord_request");
var node = require("deasync");

node.loop = node.runLoopOnce;


router.post("/new", function(req, res){
	if(req.body.submit=="exit")
	{
		res.render("listing_main");
	}
	else 
	{
		var newListing = new LandlordRequest;

		//add username and id
        newListing.requester.id = req.user._id;
        newListing.requester.username = req.user.username;
        newListing.rental_property_information = req.body.rental_property_information;
        newListing.rental_property_information.location = req.body.location;

        newListing.move_in_date = req.body.move_in_date;
        newListing.rental_duration = req.body.rental_duration;
        newListing.maximum_range_in_miles = req.body.maximum_range_in_miles;
        newListing.rental_budget = req.body.rental_budget;

        newListing.save();


		res.render("listing/landlord/new_step2", {listing_id: newListing._id});
	}
});

function handleStep2(req, res, foundListing)
{
	// this should be a number instead?
	foundListing.num_of_bedrooms = req.body.num_of_bedrooms;

	for(var bedIndex=0; bedIndex<=foundListing.num_of_bedrooms; bedIndex++)
	{
		var curBedRoom = eval(`req.body.bedroom_${bedIndex}`);
		// I want this...
		// foundListing.bedrooms.push(req.body.bedroom_1);
		// So curBedRoom should contain not just the name but the structure... let's see if it works.
		foundListing.bedrooms.push(curBedRoom);
	}

	foundListing.save();
}

function handleStep3(req, res, foundListing)
{
	foundListing.amenities = req.body.amenities;
	foundListing.save();
}

function handleStep4(req, res, foundListing)
{
	foundListing.accessible_spaces = req.body.accessible_spaces;
	foundListing.save();
}

function handleStep5(req, res, foundListing)
{
	// handle caption data?
	// 1. need to know the totall numbers uploaded.
	// <note> There could be empty picture entry....
	var processedPictures = 0;

	for(var picIndex=0; processedPictures<foundListing.num_of_pictures_uploaded;picIndex++)
	{
		if(foundListing.pictures[picIndex].path!="")
		{
			foundListing.pictures[picIndex].caption = eval(`req.body.caption_${picIndex}`);
			processedPictures++;
		}	
	}

	foundListing.save();
}


function handleStep6(req, res, foundListing)
{
	foundListing.summary_of_listing = req.body.summary_of_listing;
	foundListing.summary_of_neighborhood = req.body.summary_of_neighborhood;
	foundListing.summary_of_transportation = req.body.summary_of_transportation;
	foundListing.rental_terms = req.body.rental_terms;
	foundListing.move_in_date = req.body.move_in_date;
	foundListing.contact = req.body.contact;

	foundListing.save();
}

router.put("/:list_id", function(req, res){
	
	if(req.body.submit=="exit")
	{
		res.render("/");
	}
	else
	{
		LandlordRequest.findById(req.params.list_id, function(err, foundListing){
			if(err){
				req.flash("error", "No such listing found");
				res.redirect("/");
			} else {
				switch(req.body.submit) {
					case "step#2":
						handleStep2(req,res,foundListing);
						res.render("listing/landlord/new_step3", {listing_id: req.params.list_id});
						break;
					case "step#3":
						handleStep3(req,res,foundListing);
						res.render("listing/landlord/new_step4", {listing_id: req.params.list_id});
						break;
					case "step#4":
						handleStep4(req,res,foundListing);
						res.render("listing/landlord/new_step5", {listing_id: req.params.list_id});
						break;
					case "step#5":
						handleStep5(req,res,foundListing);
						res.render("listing/landlord/new_step6", {listing_id: req.params.list_id});
						break;
					case "step#6":
						handleStep6(req,res,foundListing);
						// need to add user ID of roommates if exists.
						req.flash("success", "Listing posted successfully");
						res.redirect("/");
						break;
					default: 
						req.flash("error", "No such step found");
						res.redirect("/");
						break;
				}
			}
		});


	}
});
// ISEO: this is just for testing

router.get("/new_step3", function(req,res){
	res.render("listing/landlord/new_step3");
});

router.get("/new_step4", function(req,res){
	res.render("listing/landlord/new_step4");
});

router.get("/new_step5", function(req,res){
	res.render("listing/landlord/new_step5");
});

router.get("/new_step6", function(req,res){
	res.render("listing/landlord/new_step6");
});


router.get("/edit", function(req,res){
	res.render("listing/landlord/new_step5");
});

router.get("/temp", function(req,res){
	res.render("listing/landlord/new_step6");
});

module.exports = router;