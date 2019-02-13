var express = require("express"),
	app = express()

var indexRoutes = require("./routes/index");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use("/", indexRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
	console.log("Linkedspaces Server Has Started! listening on IP = " + process.env.IP + " , PORT = " + process.env.PORT);
})