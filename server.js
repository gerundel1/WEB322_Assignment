/*********************************************************************************
* WEB322 – Assignment 03-05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: German Malikov Student ID: 130968191 Date: 2020-12-10
*
* Online (Heroku, https://...) Link: https://shrouded-scrubland-26194.herokuapp.com/
*
* GitHub or Bitbucket repo Link: https://github.com/gerundel1/WEB322_Assignment
*
********************************************************************************/ 

var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const _ = require ("underscore");
const fs = require("fs");
const clientSessions = require("client-sessions");
var nodemailer = require('nodemailer');
require('dotenv').config();
const connectionString = process.env.MONGODB_CONN_STR;
const mongoose = require("mongoose");


const data_service = require("./data-service.js");
const dataService = data_service(connectionString);

const validation = require("./validation.js");

const bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: true }));

const exphbs = require('express-handlebars');
const { decodeBase64 } = require("bcryptjs");
// app.engine('.hbs', exphbs({ extname: '.hbs' }));
app.engine('.hbs', exphbs({ 
    extname: '.hbs',
    defaultLayout: 'main'
}));
const PhotoModel = require("./data-models/PhotoModel");
const PHOTODIRECTORY = path.join(__dirname, 'public/meal_packages');


const storage = multer.diskStorage({
  destination: PHOTODIRECTORY,
  filename: (req, file, cb) => {
    // we write the filename as the current date down to the millisecond
    // in a large web service this would possibly cause a problem if two people
    // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
    // this is a simple example.
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'germalikov@gmail.com',
      pass: 'germalikov1'
    }
  });

app.set('view engine', '.hbs');

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

// log when the DB is connected
mongoose.connection.on("open", () => {
  console.log("Database connection open.");
});

app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "final_assignment_web322", // this should be a long un-guessable string.
    duration:  2* 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
  }));

app.get("/", function(req,res){
    dataService.getRatedPackages()
    .then(jsPackages => {
      dataService.getMainData()
      .then( jsMainData => {
        res.render('renderDataMain', {
        user: {"formData" : req.session.user},
        data: jsPackages,
        mainData: jsMainData
        }
    )})
      .catch(err => {
        console.log(err)})
    })
    .catch(err => {
      console.log(err);
    });

});

app.get("/packages", function(req,res){
  dataService.getAllPackages()
    .then(jsPackages => {
        if(!req.session.user){
        res.render('renderDataPackages', {
          user: {"formData" : req.session.user},
          data: jsPackages,
          });
      }
      else{
        var isClerk = false;
        if(req.session.user.role == "clerk") {
          isClerk = true;
        }
        res.render('renderDataPackages', {
          user: {"formData" : req.session.user},
          data: jsPackages,
          isClerk: isClerk
          });
      }
    })
    .catch(err => {
      console.log(err);
    
    });
});

app.get("/login",  (req, res) => {
    res.render('loginForm', {
        data: { },
        layout: "logAndReg"
    });

});

app.get("/register",  (req, res) => {
    res.render('registerForm', {
        data: { },
        layout: "logAndReg"
    });
});

app.post("/register" , (req, res) => {
    var formData = req.body;
    var errors = validation.validateUserForm(formData);

    if (!errors.isValid) {
        res.render('registerForm', {
            data: {"formData": formData, "errors": errors},
            layout: "logAndReg"
        });
    }
    else {
        dataService.addUser(formData)
        .then(function () {
            formData.fullName = formData.firstName + " " + formData.lastName;
            res.render('dashboard', {
                data: {"formData": formData},
                layout: "logAndReg",
                message: {"formMessage": "You are successfully registered, "},
                isLogin: false  
            });
            var mailOptions = {
              from: 'germalikov@gmail.com',
              to: formData.email,
              subject: 'Finishing Registration',
              text: 'Thank you for registration! Please proceed to login page.'
            };
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
        })
        .catch(err => {
            errors.email = err;
            res.render('registerForm', {
                data: {"formData": formData, "errors": errors},
                layout: "logAndReg"
            });
        });
       
        
    }
});

app.post ("/login", (req,res) => {
    var formData = req.body;
    var errors = validation.validateLoginForm(formData);

    
    if (!errors.isValid) {
        res.render('loginForm', {
            data: {"formData": formData, "errors": errors},
            layout: "logAndReg"
        });
    }

    else {
        dataService.login(req.body)
       .then(jsUser => {
           
          if(jsUser.role === "clerk") {
            req.session.user = {
              fullName: jsUser.fullName,
              email: jsUser.email,
              role: jsUser.role,
            };
            res.redirect("/clerkDashboard");
          }
          else {
            req.session.user = {
              fullName: jsUser.fullName,
              email: jsUser.email,
              role: jsUser.role,
              cart: { items: [], total: 0, totalItems: 0}
            };
            res.redirect("/dashboard");
          }
        })
       .catch(err =>{
           console.log("Errors in server.js' dataService.login(): ", err);
           res.render('loginForm', {
            data: {"formData": formData, "errors": err},
            layout: "logAndReg"
        });
        });
       
      }
    });

app.get("/dashboard", ensureCustomer, (req, res) => {
    res.render("dashboard", {
                             layout: "logAndReg",
                             data: {"formData" : req.session.user},
                             message: {"formMessage": "You are successfully logged in, "},
                             isLogin: true 
        });
  });

  app.get("/clerkDashboard", ensureClerk, (req, res) => {
    res.render("clerkDashboard", {
                             layout: "logAndReg",
                             data: {"formData" : req.session.user},
        });
  });

  app.get("/add-meals", ensureClerk, (req, res) => {
    formData = req.body;
    formData.role = req.session.user.role;
    res.render("clerkMain", {
      layout: "logAndReg",
      data: {"formData" : formData},
    });
  });

  app.post("/add-meals", upload.single("image"), (req, res) => {
    if(!req.file) {
      console.log ("No file received");
    }
    var formData = req.body;
    var errors = validation.validateClerkForm(formData, req.file.filename);
    const photoMetadata = new PhotoModel({
      title: formData.title,
      description: formData.description,
      image: req.file.filename,
      price: formData.price,
      amount: formData.amount,
      rated: formData.rated
    });
  
    if (!errors.isValid) {
      res.render('clerkMain', {
          data: {"formData": formData, "errors": errors},
          layout: "logAndReg"
      });
  }
  else {
    photoMetadata.save()
    .then((response) => {
      res.redirect("/packages");
    })
    .catch((err) => {
      console.log(err);
    });
    }   
  });

  app.post("/delete-meal/:filename", (req, res) => {
    const filename = req.params.filename;
  
    PhotoModel.remove({image: filename})
    .then(() => {
      fs.unlink(PHOTODIRECTORY + "/" + filename, (err) => {
        if (err) {
          return console.log(err);
        }
        console.log("Removed file : " + filename);
      }); 
      return res.redirect("/packages");
    }).catch((err) => {
      console.log(err);
    });
  });

  app.get("/update-meal/:filename", ensureClerk, (req, res) => {
    dataService.getPackageByFilename(req.params.filename)
    .then((data) => {
      console.log(data);
      var errors = validation.validateClerkForm(data, req.params.filename);
      data.role = req.session.user.role;
      if (!errors.isValid) {
        
        res.render('clerkUpdate', {
          data: {"formData": data, "errors": errors},
          layout: "logAndReg"
      });
    }
    else {
      res.render('clerkUpdate', {
        data: {"formData": data},
        layout: "logAndReg"
    });
    } 
    })
    .catch ((err) => {
      console.log(err);
    });
  });

  app.post("/update-meal/:id", upload.single("image"), (req, res) => {

    const id = req.params.id;
    if(req.file){
      req.body.image = req.file.filename;
    }

    dataService.updatePackageById(id, req.body)
    .then((package) => {
      return res.redirect("/packages");
    })
  });

  app.get("/meal-description/:id", (req, res) => {
    const id = req.params.id;
    dataService.getPackageById(id)
    .then((package) =>{
      if(req.session.user && req.session.user.role == "clerk") {
        package.formData = {};
        package.formData.role = req.session.user.role;
        res.render('packageDescription',{
          data: package,
          layout: "logAndReg",
          desc: true
        });
      }
      else {
        package.formData = {};
        package.formData.role = req.session.user.role;
        res.render('packageDescription',{
          data: package,
          layout: "logAndReg",
          desc: true,
          isNotClerk: true
        });
      }
    }).catch ((err) => {
      console.log(err);
    });
    
  });
  app.post("/meal-description/:id", ensureCustomer, (req, res) => {
    const id = req.params.id;
    dataService.getPackageById(id)
    .then((package) =>{
      req.session.user.cart.items.push(package);
      req.session.user.cart.total += package.price;
      req.session.user.cart.totalItems++;
      res.redirect("/cart-items");
    }).catch ((err) => {
      console.log(err);
    });
  });

  app.get("/cart-items", ensureCustomer, (req, res) =>{
    res.render('cartItems',{
      layout: "logAndReg",
      data: {"formData": req.session.user},
    })
  });
  app.post("/cart-items", ensureCustomer, (req, res) =>{
    req.session.user.cart.items = [];
    req.session.user.cart.total = 0;
    req.session.user.cart.totalItems = 0;
    res.render('checkout',{
      layout: "logAndReg",
      data: {"formData": req.session.user},
    });
    var mailOptions = {
      from: 'germalikov@gmail.com',
      to: req.session.user.email,
      subject: 'Purchase',
      text: 'Thank you for your purchase!'
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  });

  app.get("/logout", function(req, res) {
    req.session.reset();
    res.redirect("/login");
});

  function ensureCustomer(req, res, next) {
    if (!req.session.user || req.session.user.role != "customer") {
      res.redirect("/login");
    } else {
      next();
    }
  }

  function ensureClerk(req, res, next) {
    if (!req.session.user || req.session.user.role != "clerk") {
      res.redirect("/login");
    } else {
      next();
    }
  }

dataService.connect().then(()=>{
    app.listen(HTTP_PORT, ()=>{console.log("API listening on: " + HTTP_PORT)});
  })
  .catch((err)=>{
    console.log("unable to start the server: ", err.message);
    console.log("Did you remember to set your MongoDB Connection String in .env?");
    process.exit();
  });