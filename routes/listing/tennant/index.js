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
		// create a new listing\
		var newListing = new RentalRequest;

		//add username and id
        newListing.requester.id = req.user._id;
        newListing.requester.username = req.user.username;
        newListing.location = req.body.location;
        newListing.move_in_date = req.body.move_in_date;
        newListing.rental_duration = req.body.rental_duration;
        newListing.maximum_range_in_miles = req.body.maximum_range_in_miles;
        newListing.rental_budget = req.body.rental_budget;

        newListing.save();

		res.render("listing/tennant/new_step2", {listing_id: newListing._id});
	}
});

// the route name may need to be revised.
router.put("/:list_id", function(req, res){

	if(req.body.submit=="exit")
	{
		res.render("/");
	}
	else 
	{
		RentalRequest.findById(req.params.list_id, function(err, foundListing){
			if(err){
				req.flash("error", "No such listing found");
				res.redirect("/");
			} else {

				if(req.body.submit=="step#2")
				{
					foundListing.rental_preferences = req.body.rental_preferences;

					foundListing.save();

					res.render("listing/tennant/new_step3", {listing_id:req.params.list_id});
				} else {
					foundListing.rental_description = req.body.rental_description;

					foundListing.roommate_request = req.body.roommate_request;
					foundListing.group_rental = req.body.group_rental;
					foundListing.num_of_roommates = req.body.num_of_roommates;
					foundListing.roommate_request = req.body.roommate_request;
					foundListing.num_of_requested_roommates = req.body.num_of_requested_roommates;

					foundListing.phone = req.body.phone;
					foundListing.email = req.body.email;

					if(req.body.group_rental=="on")
					{
						var listOfRoomMate = [];
						var callBackProcessed = false;
						var userFound = false;

						// add user id to roommate list
						for(var roommate_idx=1; roommate_idx<=req.body.num_of_roommates; roommate_idx++)
						{
							callBackProcessed = false;
							userFound = false;
							// TBD
							var roommate_id = eval(`req.body.roommate_${roommate_idx}`);
							
							User.find({ "username":  roommate_id}, function (err, tempUser){
								if(err)
								{
									console.log("User not found");
								} 
								else 
								{
									if(tempUser.length==1)
									{
										// ISEO: it will be successfull even if there is no record found with given condition!!
										listOfRoomMate[roommate_idx] = {id:tempUser[0]._id, username: roommate_id};
										//console.log("roomMate=" + roomMate);
										console.log("listOfRoomMate[roommate_idx]" + listOfRoomMate[roommate_idx]);
										userFound = true;


										//foundListing.roommates.push(roomMate);
										// you should save here... otherwise all the data will be gone, Dude!!
										//foundListing.save();
									}
									else
									{
										req.flash("error", "no such error found");
									}
								}

								callBackProcessed=true;
							});

							while(callBackProcessed==false) node.loop();// This will give no chance to child process at all

							if(userFound==true) foundListing.roommates.push(listOfRoomMate[roommate_idx]);
						}

						foundListing.save();

					} 
					else
					{
						foundListing.save();
					}
					// need to add user ID of roommates if exists.
					req.flash("success", "Listing posted successfully");
					res.redirect("/");
				}
			}

		});

	}
});

module.exports = router;