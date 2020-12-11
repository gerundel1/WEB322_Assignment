const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var packageSchema = new Schema({
    "title":{
        type: String,
        "unique": true
    },
    "image": String,
    "price": Number,
    "amount": {
        type: Number,
        default: 0
    },
    "description": {
        type: String,
        default: "Empty"
    },
    "rated": {
        type: Boolean,
        default: false
    }
});
module.exports = packageSchema;
