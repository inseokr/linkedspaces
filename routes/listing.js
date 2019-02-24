var express = require("express");
var router  = express.Router();

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

router.post("/new", function(req, res){
	if(req.body.submit=="exit")
	{
		res.render("listing_main");
	}
	else 
	{
		// create a new listing
		// move on to the next step
		res.render("listing/tennant/new_step2");
	}
});

// the route name may need to be revised.
router.post("/new_2nd_step", function(req, res){
	if(req.body.submit=="exit")
	{
		res.render("listing_main");
	}
	else 
	{
		// create a new listing
		// move on to the next step
		res.render("listing/tennant/new_step3");
	}
});
module.exports = router;