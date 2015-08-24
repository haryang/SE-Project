var express = require('express');
var mongoose = require('mongoose');

var HistorySchema = new mongoose.Schema({
    username: String,
    mode: String,
    time: String,
    category: String,
    score: Number,
    epScore: Number,
    gkScore: Number,
    maScore: Number,
    pmScore: Number,
    scmScore: Number,
    sqmScore: Number,
    svvScore: Number
});

module.exports = mongoose.model('historyModels', HistorySchema);

