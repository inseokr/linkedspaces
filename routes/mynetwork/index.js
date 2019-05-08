var express = require("express");
var router  = express.Router();

var node = require("deasync");

node.loop = node.runLoopOnce;


router.get("/", function(req,res){
	res.render("mynetwork/mynetwork_main");
});

router.get("/:filename", function(req, res){
	var fileName = req.params.filename;
 	console.log("received file name=" + fileName)
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/${fileName}`));
});

module.exports = router;