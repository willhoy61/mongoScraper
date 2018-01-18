var mongoose = require("mongoose");

// referencce to schema constructor
var Schema = mongoose.Schema;

//using schema constructor create new NoteSchema object
var NoteSchema = new Schema({
	//title type string
	title: String,
	//body string
	body: String
});

// create model for schema
var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;