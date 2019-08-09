const User = require("../models/User");
const Post = require("../models/Post");
const Follow = require("../models/Follow");

exports.sharedProfileData = async function (req, res, next) {
	let isVisitorsProfile = false;
	let isFollowing = false;
	if (req.session.user) {
		isVisitorsProfile = req.profileUser._id.equals(req.session.user._id);
		isFollowing = await Follow.isVisitorFollowing(req.profileUser._id, req.visitorId);
	}
	req.isVisitorsProfile = isVisitorsProfile;
	req.isFollowing = isFollowing;
	// retrieve post, follower, and following counts
	let postCountPromise = Post.countPostsByAuthor(req.profileUser._id)
	let followerCountPromise = Follow.countFollowersById(req.profileUser._id)
	let followingCountPromise = Follow.countFollowingById(req.profileUser._id)

	let [postCount, followerCount, followingCount] = await Promise.all([postCountPromise, followerCountPromise, followingCountPromise])

	req.postCount = postCount
	req.followerCount = followerCount
	req.followingCount = followingCount
	next();
};

// ensures there is a user stored in the session before displaying certain routes. Displays an error and redirects the user back to the home page if there is no user session data
exports.routeProtection = function (req, res, next) {
	if (req.session.user) {
		next();
	} else {
		req.flash("errors", "You must be logged in to perform that action");
		req.session.save(function () {
			res.redirect("/");
		});
	}
};

exports.login = function (req, res) {
	let user = new User(req.body);
	user
		.login()
		.then(function (result) {
			req.session.user = { avatar: user.avatar, username: user.data.username, _id: user.data._id };
			// once the session data has been saved, redirect the user to the homepage
			req.session.save(function () {
				res.redirect("/");
			});
		})
		.catch(function (err) {
			req.flash("errors", err);
			req.session.save(function () {
				res.redirect("/");
			});
		});
};

// on logout, the user is redirected back to the home page after the session and its stored info has been destroyed
exports.logout = function (req, res) {
	req.session.destroy(function () {
		res.redirect("/");
	});
};

exports.register = function (req, res) {
	let user = new User(req.body);
	user
		.register()
		.then(() => {
			req.session.user = { username: user.data.username, avatar: user.avatar, _id: user.data._id };
			req.session.save(function () {
				res.redirect("/");
			});
		})
		.catch(regErrors => {
			regErrors.forEach(function (error) {
				req.flash("regErrors", error);
			});
			// ensure the session data is saved to the DB before redirecting back to the home page
			req.session.save(function () {
				res.redirect("/");
			});
		});
};

// if the user has session data, the homepage will be the actual app, otherwise their homepage will be the guest page
exports.home = async function (req, res) {
	if (req.session.user) {
		// fetch feed of posts for current user
		let posts = await Post.getFeed(req.session.user._id)
		res.render("home-dashboard", {posts: posts});
	} else {
		res.render("home-guest", { regErrors: req.flash("regErrors") });
	}
};

exports.ifUserExists = function (req, res, next) {
	User.findByUsername(req.params.username)
		.then(function (userDocument) {
			req.profileUser = userDocument;
			next();
		})
		.catch(function () {
			res.render("404");
		});
};

exports.profilePostsScreen = function (req, res) {
	// receive posts from post model by author id
	Post.findByAuthorId(req.profileUser._id)
		.then(function (posts) {
			res.render("profile", {
				currentPage: 'posts',
				posts: posts,
				profileUsername: req.profileUser.username,
				profileAvatar: req.profileUser.avatar,
				isFollowing: req.isFollowing,
				isVisitorsProfile: req.isVisitorsProfile,
				count: { postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount }

			});
		})
		.catch(function () {
			res.render("404");
		});
};

exports.profileFollowersScreen = async function (req, res) {
	try {
		let followers = await Follow.getFollowersById(req.profileUser._id);
		res.render("profile-followers", {
			currentPage: 'followers',
			followers: followers,
			profileUsername: req.profileUser.username,
			profileAvatar: req.profileUser.avatar,
			isFollowing: req.isFollowing,
			isVisitorsProfile: req.isVisitorsProfile,
			count: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
		});
	} catch {
		res.render('404')
	}
};

exports.profileFollowingScreen = async function (req, res) {
	try {
		let following = await Follow.getFollowingById(req.profileUser._id);
		res.render("profile-following", {
			currentPage: 'following',
			following: following,
			profileUsername: req.profileUser.username,
			profileAvatar: req.profileUser.avatar,
			isFollowing: req.isFollowing,
			isVisitorsProfile: req.isVisitorsProfile,
			count: { postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount }

		});
	} catch {
		res.render('404')
	}
};
