const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var howSchema = new Schema({
    "title":{
        type: String,
        "unique": true
    },
    "image": String,
    "alt": String
});
module.exports = howSchema;