var express = require('express');
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    email: String,
    passwd1: String,
    firstName: String,
    lastName: String
});

module.exports = mongoose.model('userModel', userSchema);