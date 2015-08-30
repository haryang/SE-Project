var express = require ('express');
var mongoose = require ('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passPort = require('passport');
var localStrategy = require('passport-local').Strategy;
var session = require('express-session');
var async = require("async");

var app = express();
var port = process.env.PORT || 1337;
app.use(express.static(__dirname + '/views'));
mongoose.connect('mongodb://localhost:27017/Quiz');

//models
var userModel = require('./models/userModel.js');
var questionModel = require('./models/questionModel.js');
var GKModel = require('./models/GKModel.js');
var SQMModel = require('./models/SQMModel.js');
var EPModel = require('./models/EPModel.js');
var MAModel = require('./models/MAModel.js');
var SVVModel = require('./models/SVVModel.js');
var SCMModel = require('./models/SCMModel.js');
var PMModel = require('./models/PMModel.js');
var historyModel = require('./models/historyModels.js')

//Utils
function randomNfromM (N, A){
    var i = 0, j, arr = [], M = A.length - 1, result = [];
    while(i<N){
        j = Math.floor(Math.random()*(M + 1));
        if (arr.indexOf(j)<0){
            arr.push(j);
            i++
        }
    }
    for (var k = 0; k < arr.length; k++) {
        result.push(A[arr[k]]._id);

    }
    return result
}

function getQuestionFromModel(Model, num) {
    return function(callback) {
        Model.find({}, {_id: 1}, function (err, result) {
            var questionIDs = randomNfromM(num, result);
            Model.find({_id: {$in: questionIDs}}, function (err, result) {
                callback(null, result);
            })
        });
    }
}

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
        userModel.findOne({
            email: username,
            passwd1: password
        }, function (err, user) {
            if (user) {
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
    res.json(user);
});

app.post('/logout', function (req, res) {
    console.log(req.user.username + " has logged out.")
    req.logout();
    res.sendStatus(200);
});

app.get('/loggedin', function (req, res) {
    userModel.find({email:req.user.email}, function (err, result) {
        res.send(req.isAuthenticated()? result[0]: "0")
    });
});

app.get('/quiz', function (req, res) {
    var jobs = [
        getQuestionFromModel(EPModel,11),
        getQuestionFromModel(GKModel,11),
        getQuestionFromModel(MAModel,11),
        getQuestionFromModel(PMModel,11),
        getQuestionFromModel(SCMModel,12),
        getQuestionFromModel(SQMModel,12),
        getQuestionFromModel(SVVModel,12)
    ];
    async.parallel(jobs, function (err,result) {
        var returnVal=[];
        result.forEach(function (value, index ,array) {
            for (var obj in value){
                returnVal.push(value[obj])
            }
            if (index == array.length - 1) {
                res.send(returnVal)
            }
        })
    })
});

app.post('/practise', function (req, res) {
    var jobs = [];
    console.log(req.body);
    if (req.body.GK) {
        jobs.push(getQuestionFromModel(GKModel,req.body.GK))
    }
    if (req.body.EP) {
        jobs.push(getQuestionFromModel(EPModel,req.body.EP))
    }
    if (req.body.MA) {
        jobs.push(getQuestionFromModel(MAModel,req.body.MA))
    }
    if (req.body.PM) {
        jobs.push(getQuestionFromModel(PMModel,req.body.PM))
    }
    if (req.body.SQM) {
        jobs.push(getQuestionFromModel(SQMModel,req.body.SQM))
    }
    if (req.body.SCM) {
        jobs.push(getQuestionFromModel(SCMModel,req.body.SCM))
    }
    if (req.body.SVV) {
        jobs.push(getQuestionFromModel(SVVModel,req.body.SVV))
        }
    async.parallel(jobs, function (err,result) {
        var returnVal=[];
        result.forEach(function (value, index ,array) {
            for (var obj in value){
                returnVal.push(value[obj])
            }
            if (index == array.length - 1) {
                res.send(returnVal)
            }
        })
    })

});

app.post('/saveRecord', function (req, res) {
    var newRecord = new historyModel(req.body);
    newRecord.save(function (err, result) {
        if (err) {
            res.send('error')
        } else {
            res.send(result)
        }
    })
});

app.post('/getRecord', function (req,res) {
    var query = req.body.date? {
        email:req.body.email,
        date:req.body.date
    } : {
        email:req.body.email
    }
    historyModel.find(query).exec(function (err, result) {
            res.send(result)
        })
});

app.post('/updateProfile', function(req,res){
    userModel.findOne({email: req.body.email}, function (err, result) {
        if(result && result.email){
            userModel.update({email:req.body.email},{
                passwd1: req.body.passwd1,
                firstName: req.body.firstName,
                lastName: req.body.lastName
            },false, function (err, num) {
                if (num.ok = 1){
                    console.log('success');
                    res.send('success')
                } else {
                    console.log('error');
                    res.send('error')
                }
            })
        }
    })
});

app.all('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('index.html', { root: __dirname + "/views" });
});

app.listen(port, function (){
    console.log('http://127.0.0.1:' + port + '/');
});