var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Posts = require('../dbModels/posts.js');
var privKey = require('./privKey.js');
var bodyParser = require('body-parser');
var recaptcha = require('express-recaptcha');

recaptcha.init('6LcpzREUAAAAAMb2qn7aobDAldkSgBX_fq7tpOXj', global.privKey);

/* GET home page and specify variables. */
router.get('/', function(req, res, next) {
    Posts.count({}, function(err, documentCount){
	Posts.find({}).sort({"date": 1}).exec( function(err, postData) {
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
    res.render('Text/index', { captcha:recaptcha.render() });
});

router.get('/Image', function(req, res, next) {
    res.render('Image/index');
});

/* POST request to /newText creates new text post */
router.post('/newText', function(req, res, next) {
    recaptcha.verify(req, function(error) {
	if(!error) {
	    var type = req.body.type;
	    var title = req.body.title;
	    var content = req.body.content;
	    var tags = req.body.tags;
	    var tagsSplit = tags.split(', ');

	    if (title != null) {
		title = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	    }
	    if (content != null) {
		content = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	    }
	    for (var i = 0; i < tagsSplit.length; i++) {
		if (tagsSplit[i] != null) {
		    tagsSplit[i] = tagsSplit[i].replace(/</g, "&lt;").replace(/>/g, "&gt;");
		}
	    }

	    Posts.create({type: type, title: title, content: content, tags: tagsSplit}, function(err, textPost) {
		if (err) return next(err);
		res.send('<p>Permanent post URL: example.com/postId/' + textPost._id + '</p><br><a href="/">Back to home</a>');
	    });
	}
	else {
	    res.send('ERROR');
	}
    });
});

router.post('/newImage', function(req, res, next) {
    recaptcha.verify(req, function(error) {
	if(!error) {
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
	}
	else {
	    res.send('ERROR');
	}
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
