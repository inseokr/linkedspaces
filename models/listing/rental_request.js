var mongoose = require("mongoose");

var RentalRequestSchema = new mongoose.Schema({
	requester: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      usernam: String
  	},

  	// roommates if any
  	roommates: [
     {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      }
    ],

    // 0. Initial State
    // 1. Being reviewed by middlemen or landlord
    // 2. Connected with at least with one landlord
    // 3. In the middle of negotiation
    // 4. Transaction completed 
    state: Integer,

  	// list of landlords or middlemen helping this requests
  	request_responses: [
  	 responder {
  	 	id: {
         	type: mongoose.Schema.Types.ObjectId,
         	ref: "User"
         },
         user_name: String,
         // 1: middlemen, 2: landlord
         type: Integer,
         // reference to the rental post
         post_id: {
         	type: mongoose.Schema.Types.ObjectId,
         	ref: "RentalPost"
         },
         // TBD...
         // 1: middlemen
         // 
         // 2: landlord
         state: Integer
     }
  	],

  	// rental location
  	location: {
  		street: String,
  		city: String,
  		state: String,
  		country: String,
  		zipcode: Integer
  	},
  	// move in date
  	move_in_date: {
  		month: String,
  		date: Integer,
  		year: String
  	},
  	// rental duration in months
  	rent_duration: Integer,
    
    // maximum range from the desired location
  	maximum_range_in_miles: Integer,

    // maximum possible rental per month in dollars.
  	rental_budget: Integer,

  	rental_preferences: {
		furnished: Boolean,
		parking: Boolean,
		shared_living_room: Boolean,
		garage: Boolean,
		laundry: Boolean,
		internet: Boolean,
		private_bathroom: Boolean,
		num_of_rooms: Integer,
		separate_access: Boolean,
		apartment: Boolean,
		rent_whole_unit: Boolean,
		pet_allowed: Boolean,
		easy_access_public_transport: Boolean
  	},

    // more inforamtion on the rental.
    rental_description: String,

    // want roomate?
    roommate_request: Boolean,

    // already have roomnates?
    group_rental: Boolean
});

module.exports = mongoose.model("RentalRequest", UserSchema);