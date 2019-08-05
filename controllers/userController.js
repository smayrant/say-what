const User = require("../models/User");

exports.login = function (req, res) {
	let user = new User(req.body);
	user
		.login()
		.then(function (result) {
			req.session.user = { username: user.data.username };
			res.send(result);
		})
		.catch(function (err) {
			res.send(err);
		});
};

exports.logout = function () {};

exports.register = function (req, res) {
	let user = new User(req.body);
	user.register();
	if (user.errors.length) {
		res.send(user.errors);
	} else {
		res.send("you just registered");
	}
};

exports.home = function (req, res) {
	// if the user has session data, send them to the actual  app, otherwise send them to the guest page
	if (req.session.user) {
		res.send("welcome to the app");
	} else {
		res.render("home-guest");
	}
};
