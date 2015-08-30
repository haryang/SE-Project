var express = require('express');
var mongoose = require('mongoose');

var HistorySchema = new mongoose.Schema({
    email: String,
    mode: String,
    date: String,
    score: Number,
    epWrong: Number,
    gkWrong: Number,
    maWrong: Number,
    pmWrong: Number,
    scmWrong: Number,
    sqmWrong: Number,
    svvWrong: Number,
    epNumber: Number,
    gkNumber: Number,
    maNumber: Number,
    pmNumber: Number,
    scmNumber: Number,
    sqmNumber: Number,
    svvNumber: Number,
    total: Number,
    report: Object
});

module.exports = mongoose.model('historyModels', HistorySchema);

