const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var userSchema = new Schema({
    "username": String,
    "email":  {
        "type": String,
        "unique": true
      },
    "password": String,
    "fullName": String,
    "role": {
        type: String,
        default: 'customer' 
    }  
});
  

module.exports = userSchema;