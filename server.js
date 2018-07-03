const express = require("express");
const path = require("path");

const app = express();

// Serve only the static form the dist directory
app.use(express.static(__dirname + "/dist/node-cubBot"));

app.get("/*", function(req, res) {
  res.sendFile(__dirname + "/dist/node-cubBot/index.html");
});

//Start the app by listening on the default Heroku Port
app.listen(process.env.PORT || 8080);
