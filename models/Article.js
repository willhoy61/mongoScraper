var mongoose = require("mongoose");
// reference to schema constructor
var Schema = mongoose.Schema;
// reate new UserSchema object
var ArticleSchema = new Schema({
	// title required type string
	title: {
		type: String,
		required: true
	},
	// link required type string
	link : {
		type: String,
		required: true
	},
	// populate article with an associated note
	note: {
		type: Schema.Types.ObjectId,
		ref: "Note"
	}
});
//create model for schema
var Article = mongoose.model("Article", ArticleSchema);
//exports model
module.exports = Article;