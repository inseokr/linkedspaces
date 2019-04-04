var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	firstname:  String,
	lastname:   String,
	username:   String,
	password:   String,
	email:      String,
	gender:     String,
	birthdate:  Date,

	tenant_listing: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "TenantRequest"
		}
	},

	landlord_listing: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "LandlordRequest"
		}
	}
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);