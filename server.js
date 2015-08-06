var express = require ('express');
var mongoose = require ('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passPort = require('passport');
var localStrategy = require('passport-local').Strategy;
var session = require('express-session');
var app = express();
var port = process.env.PORT || 1337;
app.use(express.static(__dirname + '/views'));
mongoose.connect('mongodb://localhost:27017/Quiz');

//models
var userModel = require('./models/userModel.js');
var questionModel = require('./models/questionModel.js');


//services
var loginService = require('./services/loginService');

//register middle-ware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    secret: "secret",
    resave: "",
    saveUninitialized: ""
}));
app.use(passPort.initialize());
app.use(passPort.session());

//passport config
passPort.use(new localStrategy({
    usernameField: 'email',
    passwordField: 'passwd1',
    session: false},
    function (username, password, done){
        //authentication method
        console.log(arguments);
        userModel.findOne({
            email: username,
            passwd1: password
        }, function (err, user) {
            if (user) {
                console.log(user)
                return done(null, user)
            }
            return  done(null, false)
        })
    }));

passPort.serializeUser(function (user, done){
    done(null, user);
});

passPort.deserializeUser(function (user, done){
    done(null, user);
});


//routes
app.post('/register', function (req, res) {
    userModel.findOne({email: req.body.email}, function (err, result) {
        if (result) {
            res.send("0");
        } else {
            var newUser = new userModel(req.body);
            newUser.save(function (err, user) {
                req.login(user, function () {
                    res.json(user);
                });
            })
        }
    })
});

app.post('/login', passPort.authenticate('local'), function(req, res){
    var user = req.user;
    console.log(req, res);
    res.json(user);
});

app.post('/logout', function (req, res) {
    console.log(req.user.username + " has logged out.")
    req.logout();
    res.sendStatus(200);
});

app.get('/loggedin', function (req, res) {
    res.send(req.isAuthenticated()? req.user: "0")
});

app.post('/quiz', function (req, res) {
    console.log(req.body);
    questionModel.find({id:{$in:req.body}}, function (err, result) {
        console.log(err, result);
        res.send(result);
    })
});

app.all('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('index.html', { root: __dirname + "/views" });
});

app.listen(port, function (){
    console.log('http://127.0.0.1:' + port + '/');
});