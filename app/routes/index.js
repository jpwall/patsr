var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Posts = require('../dbModels/posts.js');
var bodyParser = require('body-parser');

/* GET home page and specify variables. */
router.get('/', function(req, res, next) {
    Posts.count({}, function(err, documentCount){
	Posts.find({}, function(err, postData) {
	    if (err) return next(err);
	    res.render('index', { post: postData, count: documentCount });
	});
    });
});

router.get('/postId/:id', function (req, res, next) {
    Posts.findById(req.params.id, function(err, postData) {
	if(err) res.send(err);
	res.render('postId/index', { post: postData });
    });
});

router.get('/Text', function(req, res, next) {
    res.render('Text/index');
});

router.get('/Image', function(req, res, next) {
    res.render('Image/index');
});

/* POST request to /newText creates new text post */
router.post('/newText', function(req, res, next) {
    var type = req.body.type;
    var title = req.body.title;
    var content = req.body.content;
    var tags = req.body.tags;
    var tagsSplit = tags.split(', ');
    
    Posts.create({type: type, title: title, content: content, tags: tagsSplit}, function(err, textPost) {
	if (err) return next(err);
	res.send('<p>Permanent post URL: example.com/postId/' + textPost._id + '</p><br><a href="/">Back to home</a>');
	console.log(textPost.tags);
    });
});

router.post('/newImage', function(req, res, next) {
    var type = req.body.type;
    var title = req.body.title;
    var content = req.body.content;
    var contentSplit = content.split(', ');
    var caption = req.body.caption;
    var tags = req.body.tags;
    var tagsSplit = tags.split(', ');

    Posts.create({type: type, title: title, content: contentSplit, caption: caption, tags: tagsSplit}, function(err, imagePost) {
	if (err) return next(err);
	res.send('<p>Permanent post URL: example.com/postId/' + imagePost._id + '</p><br><a href="/">Back to home</a>');
    });
});

router.get('/tag/:tag', function (req, res, next) {
    Posts.count({tags: req.params.tag}, function(err, postCount) {
	Posts.find({tags: req.params.tag}, function(err, postData) {
	    res.render('tag/index', {post: postData, count: postCount});
	});
    });
});

module.exports = router;
