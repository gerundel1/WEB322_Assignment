const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


mongoose.Promise = global.Promise;

const userSchema = require('./data-models/user');

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
                    User = db.model("User", userSchema);

                    resolve();
                });
            });
        },

        addUser: function (userData) { 
            return new Promise(function (resolve, reject) {
                
            bcrypt.hash(userData.password, 10).then(hash=>{
                userData.password = hash;
                var newUser = new User(userData);
                newUser.fullName = userData.firstName + " " + userData.lastName;
                
                newUser.save((err,addedUser) => {
                    if(err) {
                        if (err.code == 11000) {
                            reject("Email already taken");
                        } else {
                            reject("There was an error creating the user: " + err);
                        }
                    } else {
                        resolve(addedUser.email);
                    }
                });
            })
            .catch(err=>{
                console.log(err);
            });
            });
        } ,
        
        login: function(userData){
            console.log("userData in login() function in data-service.js", userData);
            return new Promise(function(resolve,reject){

                User.findOne({email: userData.email})
                .exec()
                .then((user) => {
                    var jsUser = user.toObject();
                    console.log("jsUser in login() function in data-service.js", jsUser);
                    bcrypt.compare(userData.password, jsUser.password).then((result) => {
                        if (result === true) {
                            if(jsUser.email.includes("freshmeals.ca")) {
                                jsUser.role = "clerk";
                            }
                            resolve(jsUser);
                        } else {
                            var errors = {email: "", password: "Wrong password, try again!"};
                            reject(errors);
                        }
                    });
                })
                .catch((err)=>{
                    var errors = {email: "Wrong email, try again!", password: ""};
                    reject(errors);
                });
            })
        } 
    }

}

