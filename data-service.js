const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


mongoose.Promise = global.Promise; // Added to get around the deprecation warning: "Mongoose: mpromise (mongoose's default promise library) is deprecated"

// Load the schemas
const userSchema = require('./data-models/user');
// const employeeSchema = require('./data_models/employee.js');

module.exports = function(mongoDBConnectionString){

    let User;

    return {
        connect: function(){
            return new Promise(function(resolve,reject){
                let db = mongoose.createConnection(mongoDBConnectionString, 
                    { 
                        useNewUrlParser: true, 
                        useUnifiedTopology: true, 
                        useCreateIndex: true 
                    });
                
                db.on('error', (err)=>{
                    reject(err);
                });
        
                db.once('open', ()=>{
                    // Employee = db.model("Employee", employeeSchema);
                    User = db.model("User", userSchema);

                    resolve();
                });
            });
        },

        addUser: function (userData) { // register
            return new Promise(function (resolve, reject) {
                
            // Encrypt the plain text: "myPassword123"
            bcrypt.hash(userData.password, 10).then(hash=>{ // Hash the password using a Salt that was generated using 10 rounds
                // TODO: Store the resulting "hash" value in the DB
                userData.password = hash;

                // Create a newuser from the userData
                var newUser = new User(userData);
                newUser.fullName = userData.firstName + " " + userData.lastName;
                newUser.save((err,addedUser) => {
                    if(err) {
                        if (err.code == 11000) {
                            reject("User Name already taken");
                        } else {
                            reject("There was an error creating the user: " + err);
                        }
                    } else {
                        // resolve(addedUser._id);
                        resolve(addedUser.email);
                    }
                });
            })
            .catch(err=>{
                console.log(err); // Show any errors that occurred during the process
            });




                
            });
        } ,
        
        login: function(userData){
            console.log("userData in login() function in data-service.js", userData);
            return new Promise(function(resolve,reject){

                User.findOne({username: userData.username})
                .exec()
                .then((user) => {
                    var jsUser = user.toObject();
                    console.log("jsUser in login() function in data-service.js", jsUser);
                    //         Pull the password "hash" value from the DB and compare it to "myPassword123" (match)
                    bcrypt.compare(userData.password, jsUser.password).then((result) => {
                        // result === true
                        if (result === true) {
                            resolve(jsUser);
                        } else {
                            reject("Incorrect password for user " + userData.userName);
                        }
                    });
                })
                .catch((err)=>{
                    reject("Unable to find user " + userData.username);
                });
            })
        } //,
    }

}

