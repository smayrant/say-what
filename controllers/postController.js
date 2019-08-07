const Post = require("../models/Post");

exports.viewCreateScreen = function (req, res) {
	res.render("create-post");
};

// create a post
exports.create = function (req, res) {
	let post = new Post(req.body, req.session.user._id);
	post
		.create()
		.then(function (newId) {
			req.flash('success', 'New post successfully created')
			req.session.save(()=> res.redirect(`/post/${newId}`))
		})
		.catch(function (errors) {
			errors.forEach(error => req.flash('errors', error))
			req.session.save(() => res.redirect('/create-post'))
		});
};

// view an individual post
exports.viewSingle = async function (req, res) {
	try {
		let post = await Post.findSingleById(req.params.id, req.visitorId);
		res.render("single-post-screen", { post: post });
	} catch (error) {
		res.render("404");
	}
};

exports.viewEditScreen = async function (req, res) {
	try {
		let post = await Post.findSingleById(req.params.id)
		// ensure only the owner of the post can edit the post
		if(post.authorId == req.visitorId){
			res.render("edit-post", { post: post });
		}else{
			req.flash('errors', 'You do not have permission to perform that action')
			req.session.save(() => res.redirect('/'))
		}
	} catch {
		res.render('404')
	}
};

exports.edit = function(req, res){
	let post = new Post(req.body, req.visitorId, req.params.id)
	post.update().then((status) =>{
		if(status == 'success'){
			// update the post, redirecting the user back to the edit page and displaying success message
			req.flash('success', 'Post successfully updated')
			req.session.save(function(){
				res.redirect(`/post/${req.params.id}/edit`)
			})
		}else{
			post.errors.forEach(function(error){
				req.flash('errors', error)
			})
			req.session.save(function(){
				res.redirect(`/post/${req.params.id}/edit`)
			})
		}
	}).catch(() =>{
		// redirect the user to the home page if the requested id doesn't exist or if the current visitor isn't the owner of the requested post
		req.flash('errors', 'You do not have permission to perform that action')
		req.session.save(function(){
			res.redirect('/')
		})
	})
}