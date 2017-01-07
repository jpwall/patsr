var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var textPost = require('../dbModels/textPost.js');
var bodyParser = require('body-parser');

/* GET home page and specify variables. */
router.get('/', function(req, res, next) {
    textPost.count({}, function(err, documentCount){
	textPost.find({}, function(err, postData) {
	    if (err) return next(err);
	    res.render('index', { title: 'Express', post: postData, count: documentCount });
	});
    });
});

/* POST request to /newText creates new text post */
router.post('/newText', function(req, res, next) {
    var title = req.body.title;
    var content = req.body.content;
    var tags = req.body.tags;

    textPost.create({title: title, content: content, tags: tags}, function(err, textPost) {
	if (err) return next(err);
	res.json(textPost);
    });
});

// INSERT IMAGE/FILE UPLOAD ENPOINT HERE

module.exports = router;
