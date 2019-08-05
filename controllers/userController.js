const User = require("../models/User");

exports.routeProtection = function(req, res, next) {
	if(req.session.user){
		next()
	}else{
		req.flash('errors', 'You must be logged in to perform that action')
		req.session.save(function(){
			res.redirect('/')
		})
	}
}

exports.login = function (req, res) {
	let user = new User(req.body);
	user
		.login()
		.then(function (result) {
			req.session.user = { avatar: user.avatar, username: user.data.username };
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
			req.session.user = { username: user.data.username, avatar: user.avatar };
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
exports.home = function (req, res) {
	if (req.session.user) {
		res.render("home-dashboard", { username: req.session.user.username, avatar: req.session.user.avatar });
	} else {
		res.render("home-guest", { errors: req.flash("errors"), regErrors: req.flash("regErrors") });
	}
};
