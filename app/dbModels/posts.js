var mongoose = require('mongoose');
//var exports = module.exports = {};
var Posts = new mongoose.Schema({
    type: String,
    title: String,
    content: Array,
    caption: String,
    tags: Array,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Posts', Posts);
