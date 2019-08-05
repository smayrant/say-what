const usersCollection = require("../db").collection("users");
const validator = require("validator");
const bcrypt = require("bcryptjs");

let User = function (data) {
	this.data = data;
	this.errors = [];
};

// **** Placing the methods on the prototype prevents them from being duplicated with each instance of a new User ****

// ensure user input only contains string characters
User.prototype.sanitizeInput = function () {
	if (typeof this.data.username != "string") {
		this.data.username = "";
	}
	if (typeof this.data.email != "string") {
		this.data.email = "";
	}
	if (typeof this.data.password != "string") {
		this.data.password = "";
	}

	// ensure properties are not added
	this.data = {
		// trim removes any unnecessary spaces the user may have typed in
		username: this.data.username.trim().toLowerCase(),
		email: this.data.email.trim().toLowerCase(),
		password: this.data.password
	};
};

// validate the user's input
User.prototype.validate = function () {
	if (this.data.username === "") {
		this.errors.push("You must provide a username");
	}
	if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {
		this.errors.push("Please ensure your username uses only numbers and letters");
	}
	if (!validator.isEmail(this.data.email)) {
		// ensure an email address is typed in by the user
		this.errors.push("You must provide an email address");
	}
	if (this.data.password === "") {
		this.errors.push("You must provide a password");
	}
	if (this.data.password.length > 0 && this.data.password.length < 8) {
		this.errors.push("your password must be at least 8 characters");
	}
	if (this.data.password.length > 50) {
		this.errors.push("password should not exceed 50 characters");
	}
	if (this.data.username.length > 0 && this.data.username.length < 4) {
		this.errors.push("your username must be at least 4 characters");
	}
	if (this.data.username.length > 30) {
		this.errors.push("username should not exceed 30 characters");
	}
};

// login the user
User.prototype.login = function () {
	return new Promise((resolve, reject) => {
		this.sanitizeInput();
		// check if a user with the entered username is stored in the DB, then check the password against the entered password
		usersCollection
			.findOne({ username: this.data.username })
			.then(attemptedUser => {
				if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
					resolve("congrats");
				} else {
					reject("invalid");
				}
			})
			.catch(function () {
				reject("Please try again later");
			});
	});
};

// register a user.
User.prototype.register = function () {
	// ensure user input contains only string data
	this.sanitizeInput();

	// validate user data
	this.validate();

	// save user data into db if there are no validation errors
	if (!this.errors.length) {
		// hash password
		let salt = bcrypt.genSaltSync(10);
		this.data.password = bcrypt.hashSync(this.data.password, salt);
		usersCollection.insertOne(this.data);
	}
};

module.exports = User;
