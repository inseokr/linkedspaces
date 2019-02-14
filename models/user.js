var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username:  String,
	password:  String,
	email:     String,
	middlemen: Boolean,
	landlord:  Boolean,
	tennant:   Boolean
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);