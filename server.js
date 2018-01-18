var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;

// initialize express
var app = express();

//configure middleware
//use morgan logger to log request
app.use(logger("dev"));

//body parser to handle submission forms
app.use(bodyParser.urlencoded({extended: false}));

// serves the public folder as static directory
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/mongoScraper", {
  useMongoClient: true
});

app.get("/scrape", function(req, res) {

	axios.get("https://www.nytimes.com/").then(function(response) {

		var result = {};

		var $ = cheerio.load(response.data);
		// pull all h2 within article tags
		$("article h2").each(function(i, element) {

			var result ={};

			//add text and href of every link
			result.title = $(this)
			.children("a")
			.text();
			result.link = $(this)
			.children("a")
			.attr("href");

			//create new article using result object from scrape
			db.Article
			.create(result)
			.then(function(dbArticle) {
				//if scrape successull send msg
				res.send("Scrape Complete");
			})
			.catch(function(err) {
				//if error show error msg
				res.json(err)
			});
		});
	});
});

// route for getting articles from db
app.get("/articles", function(req, res) {

	db.Article
	.find({})
	.then(function(dbArticle) {
		//if scrape successfull show msg
		res.json(dbArticle);
	})
	.catch(function(err) {
		//if error throw error
		res.json(err);
	});
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article
    .findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.listen(PORT, function() {
	console.log("app listening on port" + PORT);
});



