/*********************************************************************************
* WEB322 – Assignment 03-05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: German Malikov Student ID: 130968191 Date: 2020-10-27
*
* Online (Heroku, https://...) Link: https://shrouded-scrubland-26194.herokuapp.com/
*
* GitHub or Bitbucket repo Link: https://github.com/gerundel1/WEB322_Assignment
*
********************************************************************************/ 

var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const path = require("path");
const clientSessions = require("client-sessions");
var nodemailer = require('nodemailer');
require('dotenv').config();
const connectionString = process.env.MONGODB_CONN_STR;

const data_service = require("./data-service.js");
const dataService = data_service(connectionString);

const validation = require("./validation.js");

const bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: true }));

const exphbs = require('express-handlebars');
// app.engine('.hbs', exphbs({ extname: '.hbs' }));
app.engine('.hbs', exphbs({ 
    extname: '.hbs',
    defaultLayout: 'main'
}));

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'germalikov@gmail.com',
      pass: 'germalikov1'
    }
  });

app.set('view engine', '.hbs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "final_assignment_web322", // this should be a long un-guessable string.
    duration:  2* 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
  }));

app.get("/", function(req,res){
    res.render('renderDataMain', {
        user: {"formData" : req.session.user},
        data: validation.getMealPackages()
    });
});

app.get("/packages", function(req,res){
    res.render('renderDataPackages', {
        user: {"formData" : req.session.user},
        data: validation.getUnratedPackages()
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
           console.log("message in server.js' dataService.login(): ", jsUser);
           req.session.user = {
            fullName: jsUser.fullName,
            email: jsUser.email,
            role: jsUser.role
          };
          if(jsUser.role === "clerk") {
            res.redirect("/clerkDashboard");
          }
          else {
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

  app.get("/logout", function(req, res) {
    req.session.reset();
    res.redirect("/login");
});

  function ensureCustomer(req, res, next) {
    if (!req.session.user.role || req.session.user.role != "customer") {
      res.redirect("/login");
    } else {
      next();
    }
  }

  function ensureClerk(req, res, next) {
    if (req.session.user.role != "clerk") {
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