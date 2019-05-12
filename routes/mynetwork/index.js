var express = require("express");
var User    = require("../../models/user");
var router  = express.Router();

var node = require("deasync");

node.loop = node.runLoopOnce;


router.get("/", function(req, res){

	// 1. read user dabase and construct friends_list
	// <note> let's go through the full list for now.
	User.find({}, function(error, users) {
		var friends_list = [];

		users.forEach(function(user){
			if(req.user._id.equals(user._id)!=true)
			{
				var friend = {profile_picture: "../public/user_resources/pictures/Chinh - Vy.jpg", 
				              name: user.firstname + user.lastname, 
				              address: {city: "San Jose", state: "CA"}};
				friends_list.push(friend);
			}
		});

		res.render("mynetwork/mynetwork_main", {friends_list: friends_list});
	})

	//var friends_list = [];
	//var chinh = {profile_picture: "../public/user_resources/pictures/Chinh - Vy.jpg", name: "Chinh Le", address: {city: "San Jose", state: "CA"} } ;
	//friends_list.push(chinh);
	//var peter = {profile_picture: "../public/user_resources/pictures/Peter.jpg", name: "Peter Bae", address: {city: "Cupertino", state: "CA"} } ;
	//friends_list.push(peter);
});

router.get("/:filename", function(req, res){
	var fileName = req.params.filename;
 	console.log("received file name=" + fileName)
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/${fileName}`));
});

module.exports = router;