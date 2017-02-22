var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Posts = require('../dbModels/posts.js');
var bodyParser = require('body-parser');
var recaptcha = require('express-recaptcha');
var config = require('config');

// config declarations
var pubKey = config.get('Backend.ReCAPTCHA.pubKey');
var privKey = config.get('Backend.ReCAPTCHA.privKey');
var hostURL = config.get('Backend.Host.url');
var postPerPage = config.get('Frontend.Posts.perPage');
var viewsPerPage = config.get('Frontend.Posts.viewsPerPage');

// reCAPTCHA initiation
recaptcha.init(pubKey, privKey);

// GET home page and specify variables.
router.get('/', function(req, res, next) {
    Posts.count({}, function(err, documentCount){
	if (documentCount > postPerPage) {
	    Posts.find({}).sort({"date": 1}).skip(documentCount-postPerPage).limit(postPerPage).exec( function(err, postData) {
		if (err) return next(err);
		res.render('index', { post: postData, page: 0, count: postPerPage, pageIdentifier: "paginated" });
	    });
	}
	else {
	    Posts.find({}).sort({"date": 1}).exec( function(err, postData) {
		if (err) return next(err);
		res.render('index', { post: postData, count: documentCount });
	    });
	}
	Posts.find({}).sort({"date": -1}).limit(viewsPerPage).exec( function(err, data) {
            var v = Posts.update({"_id": {$in: data}}, {$inc: {"views": 1}}, {multi: true});
            v.exec(function(err) {
		if (err) return next(err);
            });
	});

    });
});

// GET next pages after first
router.get('/page/:page', function(req, res, next) {
    Posts.count({}, function(err, documentCount) {
	if (documentCount%postPerPage != 0 && req.params.page >= parseInt(documentCount/postPerPage)) {
	    Posts.find({}).sort({"date": 1}).limit(documentCount%postPerPage).exec( function(err, postData) {
		if (err) return next(err);
		res.render('index', { post: postData, count: documentCount%postPerPage });
	    });
	}
	else {
	    Posts.find({}).sort({"date": 1}).skip(documentCount-(postPerPage*req.params.page)).limit(postPerPage).exec( function(err, postData) {
		if (err) return next(err);
		res.render('index', { post: postData, page: req.params.page, count: postPerPage, pageIdentifier: "paginated" });
	    });
	}
	Posts.find({}).sort({"date": -1}).skip(req.params.page*postPerPage).limit(viewsPerPage).exec( function(err, data) {
	    var v = Posts.update({"_id": {$in: data}}, {$inc: {"views": 1}}, {multi: true});
	    v.exec(function(err) {
		if (err) return next(err);
	    });
	});
    });
});

// GET tag page(s)
router.get('/tag/:tag', function(req, res, next) {
    var allTags = req.params.tag;
    var allTagsLower = allTags.toLowerCase();
    var tagSplit = allTagsLower.split(', ');
    Posts.count({tags: { $all: tagSplit } }, function(err, documentCount) {
	if (documentCount > postPerPage) {
	    Posts.find({tags: { $all: tagSplit } }).sort({"date": 1}).skip(documentCount-postPerPage).limit(postPerPage).exec( function(err, postData) {
		if (err) return next(err);
		res.render('index', { post: postData, page: 0, count: postPerPage, pageIdentifier: "paginated" });
	    });
	}
	else {
	    Posts.find({tags: { $all: tagSplit } }).sort({"date": 1}).exec( function(err, postData) {
		if (err) return next(err);
		res.render('index', { post: postData, count: documentCount });
	    });
	}
	Posts.find({tags: { $all: tagSplit } }).sort({"date": -1}).limit(viewsPerPage).exec( function(err, data) {
	    var v = Posts.update({"_id": {$in: data}}, {$inc: {"views": 1}}, {multi: true});
	    v.exec(function(err) {
		if (err) return next(err);
	    });
	});
    });
});

router.get('/tag/:tag/page/:page', function(req, res, next) {
    var allTags = req.params.tag;
    var allTagsLower = allTags.toLowerCase();
    var tagSplit = allTagsLower.split(', ');
    Posts.count({tags: { $all: tagSplit }}, function(err, documentCount) {
	if (documentCount%postPerPage != 0 && req.params.page >= parseInt(documentCount/postPerPage)) {
	    Posts.find({tags: { $all: tagSplit } }).limit(documentCount%postPerPage).exec( function(err, postData) {
		res.render('index', { post: postData, count: documentCount%postPerPage });
	    });
	}
	else {
	    Posts.find({tags: { $all: tagSplit } }).skip(documentCount-(postPerPage*req.params.page)).limit(postPerPage).exec( function(err, postData) {
		if (err) return next(err);
		res.render('index', { post: postData, page: req.params.page, count: postPerPage, pageIdentifier: "paginated"});
	    });
	}
	Posts.find({tags: { $all: tagSplit } }).sort({"date": -1}).skip(postPerPage*req.params.page).limit(viewsPerPage).exec( function(err, data) {
	    var v = Posts.update({"_id": {$in: data}}, {$inc: {"views": 1}}, {multi: true});
	    v.exec(function(err) {
		if (err) return next(err);
	    });
	});
    });
});

// GET exclude page(s)
router.get('/exclude/:tag', function(req, res, next) {
    var allTags = req.params.tag;
    var allTagsLower = allTags.toLowerCase();
    var tagSplit = allTagsLower.split(', ');
    Posts.count({tags: { $nin: tagSplit } }).exec( function(err, documentCount) {
	if (documentCount > postPerPage) {
	    Posts.find({tags: { $nin: tagSplit } }).sort({"date": 1}).skip(documentCount-postPerPage).limit(postPerPage).exec( function(err, postData) {
		if (err) return next(err);
		res.render('index', { post: postData, page: 0, count: postPerPage, pageIdentifier: "paginated" });
	    });
	}
	else {
	    Posts.find({tags: { $nin: tagSplit } }).sort({"date": 1}).exec( function(err, postData) {
		if (err) return next(err);
		console.log(req.params.tag);
		res.render('index', { post: postData, count: documentCount });
	    });
	}
	Posts.find({tags: { $nin: tagSplit } }).sort({"date": -1}).limit(viewsPerPage).exec( function(err, data) {
	    var v = Posts.update({"_id": {$in: data}}, {$inc: {"views": 1}}, {multi: true});
	    v.exec(function(err) {
		if (err) return next(err);
	    });
	});
    });
});

router.get('/exclude/:tag/page/:page', function(req, res, next) {
    var allTags = req.params.tag;
    var allTagsLower = allTags.toLowerCase();
    var tagSplit = allTagsLower.split(', ');
    Posts.count({tags: { $nin: tagSplit }}, function(err, documentCount) {
	if (documentCount%postPerPage != 0 && req.params.page >= parseInt(documentCount/postPerPage)) {
	    Posts.find({tags: { $nin: tagSplit } }).limit(documentCount%postPerPage).exec( function(err, postData) {
		res.render('index', { post: postData, count: documentCount%postPerPage });
	    });
	}
	else {
	    Posts.find({tags: { $nin: tagSplit } }).skip(documentCount-(postPerPage*req.params.page)).limit(postPerPage).exec( function(err, postData) {
		if (err) return next(err);
		res.render('index', { post: postData, page: req.params.page, count: postPerPage, pageIdentifier: "paginated"});
	    });
	}
	Posts.find({tags: { $nin: tagSplit } }).sort({"date": -1}).skip(postPerPage*req.params.page).limit(viewsPerPage).exec( function(err, data) {
	    var v = Posts.update({"_id": {$in: data}}, {$inc: {"views": 1}}, {multi: true});
	    v.exec(function(err) {
		if (err) return next(err);
	    });
	});
    });
});

// GET singular post
router.get('/postId/:id', function (req, res, next) {
    Posts.find({"_id": req.params.id}, function(err, postData) {
	if(err) res.send(err);
	res.render('index', { post: postData, count: 1 });
	var v = Posts.update({"_id": {$in: postData}}, {$inc: {"views": 1}}, {multi: true});
	v.exec(function(err) {
	    if (err) return next(err);
	});
    });
});

// GET pages for Search and new Text and Image posts
router.get('/Text', function(req, res, next) {
    res.render('Text/index', { key: pubKey });
});

router.get('/Image', function(req, res, next) {
    res.render('Image/index', { key: pubKey });
});

router.get('/Search', function(req, res, next) {
    res.render('Search/index');
});

// POST request to /Text or /Image creates new respective post
router.post('/Text', function(req, res, next) {
    recaptcha.verify(req, function(error) {
	if(!error) {
	    var type = req.body.type;
	    var title = req.body.title;
	    var content = req.body.content;
	    var tags = req.body.tags;
	    var tagsLower = tags.toLowerCase();
	    var tagsSplit = tagsLower.split(', ');
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
		    res.send(res.render('post/new', {postId: textPost._id, host: hostURL}));
	    });
	    }
	}
	else {
	    res.send(res.render('error/reCAPTCHA'));
	}
    });
});

router.post('/Image', function(req, res, next) {
    recaptcha.verify(req, function(error) {
	if(!error) {
	    var type = req.body.type;
	    var title = req.body.title;
	    var content = req.body.content;
	    var contentSplit = content.split(', ');
	    var caption = req.body.caption;
	    var tags = req.body.tags;
	    var tagsLower = tags.toLowerCase();
	    var tagsSplit = tagsLower.split(', ');
	    if (tags.indexOf('#') != -1 || tags.indexOf('$') != -1 || tags.indexOf(';') != -1) {
		res.send(res.render('error/tagParsing'));
	    }
	    else {
		Posts.create({type: type, title: title, content: contentSplit, caption: caption, tags: tagsSplit}, function(err, imagePost) {
		    if (err) return next(err);
		    res.send(res.render('post/new', {postId: imagePost._id, host: hostURL}));
		});
	    }
	}
	else {
	    res.send(res.render('error/reCAPTCHA'));
	}
    });
});

// POST for search requests
router.post('/Search', function(req, res, next) {
    var search = req.body.search;
    var type = req.body.type;
    if (search.indexOf('#') != -1 || search.indexOf('$') != -1 || search.indexOf(';') != -1) {
	res.send(res.render('error/tagParsing'));
    }
    else {
	if (req.body.type == 'include') {
	    res.redirect('/tag/'+search);
	}
	if (req.body.type == 'exclude') {
	    res.redirect('/exclude/'+search);
	}
    }
});

module.exports = router;
