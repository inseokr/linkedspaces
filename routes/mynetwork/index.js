var express = require("express");
var User    = require("../../models/user");
var router  = express.Router();

var node = require("deasync");

node.loop = node.runLoopOnce;


async function getCurUser(req)
{
	// TBD: it fails to find current user!!
	// hmm... it's strange, but it didn't work if I add reject case....
	return new Promise((resolve, reject) => {
		User.findById(req.user._id, function(err, curr_user){
			if(err)
			{
				console.log("err = " + err);
				reject("user doesn't exist");
			}
			else
			{
				resolve(curr_user);
			}
		});
	});

}

async function buildRecommendedFriendsList(req) {

	return new Promise(resolve => {

		User.find({}, function(error, users) {
			var recommended_friends_list = [];

			users.forEach(function(user){
				if(req.user._id.equals(user._id)!=true)
				{
					var friend = {profile_picture: "../public/user_resources/pictures/Chinh - Vy.jpg", 
					              name: user.firstname + user.lastname, 
					              address: {city: "San Jose", state: "CA"},
					              id: user._id};
					recommended_friends_list.push(friend);
				}
			});

			resolve(recommended_friends_list);
		});
	});
} 


function getSummaryOfUser(user_id) {

	return new Promise(resolve => {
		User.findById(user_id, function(err, curr_user){
			var friend = 
			{
				profile_picture: "../public/user_resources/pictures/Chinh - Vy.jpg",
				name: curr_user.firstname+curr_user.lastname, 
				address: {city: "San Jose", state: "CA"},
				id: user_id
			}; 

			resolve(friend);
		});	

	});

}

function buildPendingFriendsList(curr_user) {

	return new Promise(async resolve => {

		var pendingFriendsList = [];

		curr_user.outgoing_friends_requests.forEach(function (cur_friend) {
			getSummaryOfUser(cur_friend.id).then(friend=> pendingFriendsList.push(friend));
		});

		resolve(pendingFriendsList);
	});
} 

function pushFriendReqstList(list, friend){
	return new Promise(resolve => {
		list.push(friend);
		resolve(list);
	});
}


function buildIncomingFriendReqList(curr_user) {
	return new Promise(async resolve => {

		var incomingFriendRequestList = [];

		if(curr_user.incoming_friends_requests.length==0) 
		{
			resolve(incomingFriendRequestList);
		}

		for(var friend_idx=0; friend_idx < curr_user.incoming_friends_requests.length ;  friend_idx++)
		{
			const friend =  await getSummaryOfUser(curr_user.incoming_friends_requests[friend_idx].id);
			const res    =  await pushFriendReqstList(incomingFriendRequestList, friend);

			if((friend_idx+1)==curr_user.incoming_friends_requests.length)
			{
				resolve(incomingFriendRequestList);
			}			
		}
	});
} 

async function buildMyNetworkList(req) {

     return new Promise(async resolve => {

		var networkInfo = {};

		const curUser = await getCurUser(req);


		networkInfo.recommended_friends_list 	  = await buildRecommendedFriendsList(req);
		networkInfo.pending_friends_reqeust_list  = await buildPendingFriendsList(curUser);

		buildIncomingFriendReqList(curUser).then((req_list) => 
		{
			networkInfo.number_of_friends = curUser.direct_friends.length;
			networkInfo.incoming_friends_request_list=req_list;
			resolve(networkInfo);
		});
	});
}

router.get("/", function(req, res){

	buildMyNetworkList(req).then((networkInfo) => {

		res.render("mynetwork/mynetwork_main", {network_info: networkInfo});

	});
});


router.post("/:friend_id/friend_request", function(req, res){

	User.findById(req.params.friend_id, function(err, user){

		if(err){
			console.log("No such user found");
		}
		else
		{
			User.findById(req.user._id, function(err, curr_user){
				// ISEO: I don't know why name is not saved to the database...
				var requestingFriend = {id: req.user._id, name: curr_user.firstname + curr_user.lastname};
				user.incoming_friends_requests.push(requestingFriend);
				user.save();

				var invitedFriend = {id: user._id, name: user.firstname + user.lastname};

				curr_user.outgoing_friends_requests.push(invitedFriend);
				curr_user.save();

				// Let's render with updated database...
			});

/*
			// This doen't work at all...
			var requestingFriend = {id: req.user._id, name: "In Seo"};
			User.findByIdAndUpdate(req.user._id,
    			{$push: {outgoing_friends_requests: requestingFriend}},
    			{safe: true, upsert: true},
    			function(err, picked_user) {
        			if(err){
        				console.log(err);
        			}else{
        				//do stuff
        				picked_user.save();
        			}
    		});
    		*/

		}
	});

});

router.get("/:filename", function(req, res){
	var fileName = req.params.filename;
 	console.log("received file name=" + fileName)
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/${fileName}`));
});

module.exports = router;