const usersCollection = require("../db").collection("users");
const validator = require("validator");

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
	if (this.data.password.length > 100) {
		this.errors.push("password should not exceed 100 characters");
	}
	if (this.data.username.length > 0 && this.data.username.length < 4) {
		this.errors.push("your username must be at least 4 characters");
	}
	if (this.data.username.length > 30) {
		this.errors.push("username should not exceed 30 characters");
	}
};

User.prototype.login = function () {
	return new Promise((resolve, reject) => {
		this.sanitizeInput();
		// check if a user
		usersCollection
			.findOne({ username: this.data.username })
			.then(attemptedUser => {
				if (attemptedUser && attemptedUser.password == this.data.password) {
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
		usersCollection.insertOne(this.data);
	}
};

module.exports = User;
