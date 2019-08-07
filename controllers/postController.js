const Post = require("../models/Post");

exports.viewCreateScreen = function (req, res) {
	res.render("create-post");
};

// create a post
exports.create = function (req, res) {
	let post = new Post(req.body, req.session.user._id);
	post
		.create()
		.then(function () {
			res.send("new post made");
		})
		.catch(function (errors) {
			res.send(errors);
		});
};

// view an individual post
exports.viewSingle = async function (req, res) {
	try {
		let post = await Post.findSingleById(req.params.id);
		res.render("single-post-screen", { post: post });
	} catch (error) {
		res.render("404");
	}
};
