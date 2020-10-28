var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const path = require("path");
var nodemailer = require('nodemailer');

const dataService = require('./data-service');

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
        data: dataService.getMealPackages()
    });
});

app.get("/packages", function(req,res){
    res.render('renderDataPackages', {
        data: dataService.getUnratedPackages()
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
    var errors = dataService.validateUserForm(formData);

    if (!errors.isValid) {
        res.render('registerForm', {
            data: {"formData": formData, "errors": errors},
            layout: "logAndReg"
        });
    }
    else {
        res.render('dashboard', {
            data: {"formData": formData},
            layout: "logAndReg"
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
    }
});

app.post ("/login", (req,res) => {
    var formData = req.body;
    var errors = dataService.validateLoginForm(formData);

    
    if (!errors.isValid) {
        res.render('loginForm', {
            data: {"formData": formData, "errors": errors},
            layout: "logAndReg"
        });
    }

    else {
        res.render('renderDataMain', {
            data: dataService.getMealPackages()
        });
    }
})

app.listen(HTTP_PORT, onHttpStart);