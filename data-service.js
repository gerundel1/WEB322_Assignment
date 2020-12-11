const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


mongoose.Promise = global.Promise;

const userSchema = require('./data-models/user');
const packageSchema = require('./data-models/package');
const howSchema = require('./data-models/howItWorks');

module.exports = function(mongoDBConnectionString){

    let User;
    let Package;
    let HowWorks;

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
                    User = db.model('User', userSchema, 'users');
                    Package = db.model('packages', packageSchema, 'packages');
                    HowWorks = db.model('HowWorks', howSchema, 'main_data');
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
        }, 

        getRatedPackages: function() {
            return new Promise(function(resolve,reject){
                
                Package.find({rated: true}).exec().then((packages) => {
                    var jsPackages = packages.map(value => value.toObject());
                    resolve(jsPackages);
                })
                .catch(err=>{
                    console.log(err);
                });

            });
        },
        getAllPackages: function() {
            return new Promise(function(resolve,reject){
                Package.find({}).exec().then((packages) => {
                    var jsPackages = packages.map(value => value.toObject());
                    resolve(jsPackages);
                })
                .catch(err=>{
                    console.log(err);
                });

            });
        },

        getPackageByFilename: function(filename) {
            return new Promise(function(resolve,reject){
                Package.findOne({image: filename}).exec().then((package) => {
                    resolve(package.toObject());
                })
                .catch(err=>{
                    console.log(err);
                });

            });
        },
        getPackageById: function(id) {
            return new Promise(function(resolve,reject){
                Package.findOne({_id: id}).exec().then((package) => {
                    resolve(package.toObject());
                })
                .catch(err=>{
                    console.log(err);
                });

            });
        },

        updatePackageById: function(id, formData) {
            return new Promise(function(resolve,reject){
                Package.findOne({_id: id}).exec().then((package) => {
                    if(formData.title && formData.title != package.title) {
                        package.title = formData.title;
                    }
                    if(formData.description && formData.description != package.description ) {
                        package.description = formData.description;
                    }
                    if(formData.image && formData.image != package.image ) {
                        package.image = formData.image;
                    }
                    if(formData.amount && formData.amount != package.amount ) {
                        package.amount = formData.amount;
                    }
                    if(formData.price && formData.price != package.price ) {
                        package.price = formData.price;
                    }
                    package.save();
                    resolve(package.toObject());
                })
                .catch(err=>{
                    console.log(err);
                });

            });
        },

        getMainData: function() {
            return new Promise(function(resolve,reject){
                
                HowWorks.find({}).exec().then((elements) => {
                    var jsElements = elements.map(value => value.toObject());
                    resolve(jsElements);
                })
                .catch(err=>{
                    console.log(err);
                });

            });
        },

    }

}

