var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Posts = require('../dbModels/posts.js');
var privKey = require('./privKey.js');
var bodyParser = require('body-parser');
var recaptcha = require('express-recaptcha');

recaptcha.init('6LcpzREUAAAAAMb2qn7aobDAldkSgBX_fq7tpOXj', global.privKey);

/*function getMultiplePosts(limit, viewLimit, page, tag) {
    
}

function getSinglePost(id) {
    Posts.findById(id, function(err, postData) {
	if(err) res.send(err);
	res.render('index', {post: postData, pageIdentifier: "single", count: 1});
    });
}*/

// GET home page and specify variables.
router.get('/', function(req, res, next) {
    Posts.count({}, function(err, documentCount){
	if (documentCount > 100) {
	    Posts.find({}).sort({"date": 1}).skip(documentCount-100).limit(100).exec( function(err, postData) {
		if (err) return next(err);
		res.render('index', { post: postData, page: 0, count: 100, pageIdentifier: "paginated" });
	    });
	}
	else {
	    Posts.find({}).sort({"date": 1}).exec( function(err, postData) {
		if (err) return next(err);
		res.render('index', { post: postData, count: documentCount });
	    });
	}
	Posts.find({}).sort({"date": -1})/*.skip(documentCount-100)*/.limit(20).exec( function(err, data) {
            var v = Posts.update({"_id": {$in: data}}, {$inc: {"views": 1}}, {multi: true});
            v.exec(function(err) {
		if (err) return next(err);
            });
	});

    });
});

router.get('/page/:page', function(req, res, next) {
    Posts.count({}, function(err, documentCount) {
	if (documentCount%100 != 0 && req.params.page >= parseInt(documentCount/100)) {
	    Posts.find({}).sort({"date": 1}).limit(documentCount%100).exec( function(err, postData) {
		if (err) return next(err);
		res.render('index', { post: postData, count: documentCount%100 });
	    });
	}
	else {
	    Posts.find({}).sort({"date": 1}).skip(documentCount-(100*req.params.page)).limit(100).exec( function(err, postData) {
		if (err) return next(err);
		res.render('index', { post: postData, page: req.params.page, count: 100, pageIdentifier: "paginated" });
	    });
	}
	Posts.find({}).sort({"date": -1}).skip(req.params.page*100).limit(20).exec( function(err, data) {
	    var v = Posts.update({"_id": {$in: data}}, {$inc: {"views": 1}}, {multi: true});
	});
    });
});

router.get('/tag/:tag', function(req, res, next) {
    var allTags = req.params.tag;
    var tagSplit = allTags.split(', ');
    Posts.count({tags: { $all: tagSplit } }, function(err, documentCount) {
	if (documentCount > 100) {
	    Posts.find({tags: { $all: tagSplit } }).sort({"date": 1}).skip(documentCount-100).limit(100).exec( function(err, postData) {
		if (err) return next(err);
		res.render('index', { post: postData, page: 0, count: 100, pageIdentifier: "paginated" });
	    });
	}
	else {
	    Posts.find({tags: { $all: tagSplit } }).sort({"date": 1}).exec( function(err, postData) {
		if (err) return next(err);
		res.render('index', { post: postData, count: documentCount });
	    });
	}
    });
});

router.get('/tag/:tag/page/:page', function(req, res, next) {
    var allTags = req.params.tag;
    var tagSplit = allTags.split(', ');
    Posts.count({tags: { $all: tagSplit }}, function(err, documentCount) {
	if (documentCount%100 != 0 && req.params.page >= parseInt(documentCount/100)) {
	    Posts.find({tags: { $all: tagSplit } }).limit(documentCount%100).exec( function(err, postData) {
		res.render('index', { post: postData, count: documentCount%100 });
	    });
	}
	else {
	    Posts.find({tags: { $all: tagSplit } }).skip(documentCount-(100*req.params.page)).limit(100).exec( function(err, postData) {
		if (err) return next(err);
		res.render('index', { post: postData, page: req.params.page, count: 100, pageIdentifier: "paginated-tag", tag: req.params.tag });
	    });
	}
    });
});

router.get('/exclude/:tag', function(req, res, next) {
    var allTags = req.params.tag;
    var tagSplit = allTags.split(', ');
    Posts.count({tags: { $nin: tagSplit } }).exec( function(err, documentCount) {
	if (documentCount > 100) {
	    Posts.find({tags: { $nin: tagSplit } }).sort({"date": 1}).skip(documentCount-100).limit(100).exec( function(err, postData) {
		if (err) return next(err);
		res.render('index', { post: postData, page: 0, count: 100, pageIdentifier: "paginated" });
	    });
	}
	else {
	    Posts.find({tags: { $nin: tagSplit } }).sort({"date": 1}).exec( function(err, postData) {
		if (err) return next(err);
		console.log(req.params.tag);
		res.render('index', { post: postData, count: documentCount });
	    });
	}
    });
});

router.get('/postId/:id', function (req, res, next) {
    Posts.find({"_id": req.params.id}, function(err, postData) {
	if(err) res.send(err);
	res.render('index', { post: postData, count: 1 });
    });
    //getSinglePost(req.params.id);
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
	    var views = req.body.views;

	    if (tags.indexOf('#') != -1 || tags.indexOf('$') != -1 || tags.indexOf(';') != -1) {
		res.send(res.render('error/tagParsing'));
	    }
	    else {
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

		Posts.create({type: type, title: title, content: content, tags: tagsSplit, views: views}, function(err, textPost) {
		if (err) return next(err);
		res.send(res.render('post/new', {postId: textPost._id}));
	    });
	    }
	}
	else {
	    res.send(res.render('error/reCAPTCHA'));
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
	    if (tags.indexOf('#') != -1 || tags.indexOf('$') != -1 || tags.indexOf(';') != -1) {
		res.send(res.render('error/tagParsing'));
	    }
	    Posts.create({type: type, title: title, content: contentSplit, caption: caption, tags: tagsSplit}, function(err, imagePost) {
		if (err) return next(err);
		res.send(res.render('post/new', {postId: imagePost._id}));
	    });
	}
	else {
	    res.send(res.render('error/reCAPTCHA'));
	}
    });
});

router.get('/tag/:tag', function (req, res, next) {
    Posts.count({tags: req.params.tag}, function(err, postCount) {
	Posts.find({tags: req.params.tag}, function(err, postData) {
	    res.render('index', {post: postData, count: postCount});
	});
    });
});

module.exports = router;
