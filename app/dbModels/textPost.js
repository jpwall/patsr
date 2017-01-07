var mongoose = require('mongoose');

var textPost = new mongoose.Schema({
//    type: 'text',
    title: String,
    content: String,
    tags: Array,
    date: { type: Date, default: Date.now }
});

/*
var imagePost = new mongoose.Schema({
//    type: 'image',
    title: String,
    content: Buffer,
    caption: String,
    tags: Array,
    date: { type: Date, default: Date.now }
});

var filePost = new mongoose.Schema({
//    type: 'file',
    title: String,
    content: Buffer,
    description: String,
    tags: Array,
    date: { type: Date, default: Date.now }
});*/
module.exports = mongoose.model('textPost', textPost);
//module.exports = mongoose.model('imagePost', imagePost);
//module.exports = mongoose.model('filePost', filePost);
