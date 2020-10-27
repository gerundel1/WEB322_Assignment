var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const path = require("path");

const dataService = require('./data-service');

const bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: true }));

const exphbs = require('express-handlebars');
// app.engine('.hbs', exphbs({ extname: '.hbs' }));
app.engine('.hbs', exphbs({ 
    extname: '.hbs',
    defaultLayout: 'main'
}));

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

app.listen(HTTP_PORT, onHttpStart);