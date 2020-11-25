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

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.get("/", function(req,res){
    res.render('renderDataMain', {
        data: validation.getMealPackages()
    });
});

app.get("/packages", function(req,res){
    res.render('renderDataPackages', {
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
            res.render('dashboard', {
                data: {"formData": formData},
                layout: "logAndReg"
            });
        })
        .catch(err => {
          res.send("Not registered, error: " + err);
        });
       
        // var mailOptions = {
        //     from: 'germalikov@gmail.com',
        //     to: formData.email,
        //     subject: 'Finishing Registration',
        //     text: 'Thank you for registration! Please proceed to login page.'
        //   };
        //   transporter.sendMail(mailOptions, function(error, info){
        //     if (error) {
        //       console.log(error);
        //     } else {
        //       console.log('Email sent: ' + info.response);
        //     }
        //   });
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
        res.render('renderDataMain', {
            data: validation.getMealPackages()
        });
    }
})

dataService.connect().then(()=>{
    app.listen(HTTP_PORT, ()=>{console.log("API listening on: " + HTTP_PORT)});
  })
  .catch((err)=>{
    console.log("unable to start the server: ", err.message);
    console.log("Did you remember to set your MongoDB Connection String in .env?");
    process.exit();
  });