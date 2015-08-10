var express = require('express');
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    birthday: String
});

module.exports = mongoose.model('userModel', userSchema);
