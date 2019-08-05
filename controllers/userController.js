const User = require("../models/User");

exports.login = function (req, res) {
	let user = new User(req.body);
	user
		.login()
		.then(function (result) {
			req.session.user = { username: user.data.username };
			// once the session data has been saved, redirect the user to the homepage
			req.session.save(function () {
				res.redirect("/");
			});
		})
		.catch(function (err) {
			res.send(err);
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
	user.register();
	if (user.errors.length) {
		res.send(user.errors);
	} else {
		res.send("you just registered");
	}
};

// if the user has session data, the homepage will be the actual app, otherwise their homepage will be the guest page
exports.home = function (req, res) {
	if (req.session.user) {
		res.render("home-dashboard", { username: req.session.user.username });
	} else {
		res.render("home-guest");
	}
};
