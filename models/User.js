const usersCollection = require("../db").collection("users");
const validator = require("validator");
const md5 = require("md5");
const bcrypt = require("bcryptjs");

let User = function (data, getAvatar) {
	this.data = data;
	this.errors = [];
	if (getAvatar == undefined) {
		getAvatar = false;
	}
	if (getAvatar) {
		this.getAvatar();
	}
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
	return new Promise(async (resolve, reject) => {
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
			this.errors.push("Your password must be at least 8 characters");
		}
		if (this.data.password.length > 50) {
			this.errors.push("Password should not exceed 50 characters");
		}
		if (this.data.username.length > 0 && this.data.username.length < 4) {
			this.errors.push("Your username must be at least 4 characters");
		}
		if (this.data.username.length > 30) {
			this.errors.push("Username should not exceed 30 characters");
		}

		// ensure username is valid then check if it has already been used
		if (
			this.data.username.length > 3 &&
			this.data.username.length < 31 &&
			validator.isAlphanumeric(this.data.username)
		) {
			let usernameExists = await usersCollection.findOne({ username: this.data.username });
			if (usernameExists) {
				this.errors.push("Username already exists");
			}
		}

		// ensure email is valid then check if it has already been used
		if (validator.isEmail(this.data.email)) {
			let emailExists = await usersCollection.findOne({ email: this.data.email });
			if (emailExists) {
				this.errors.push("Email already exists");
			}
		}
		resolve();
	});
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
					this.data = attemptedUser;
					this.getAvatar();
					resolve("You have logged in");
				} else {
					reject("Invalid credentials");
				}
			})
			.catch(function (err) {
				console.log(err);
				reject(err);
			});
	});
};

// register a user.
User.prototype.register = function () {
	return new Promise(async (resolve, reject) => {
		// ensure user input contains only string data
		this.sanitizeInput();

		// validate user data
		await this.validate();

		// save user data into db if there are no validation errors
		if (!this.errors.length) {
			// hash password
			let salt = bcrypt.genSaltSync(10);
			this.data.password = bcrypt.hashSync(this.data.password, salt);
			await usersCollection.insertOne(this.data);
			this.getAvatar();
			resolve();
		} else {
			reject(this.errors);
		}
	});
};

// retrieve the user's avatar based on their email using Gravatar
User.prototype.getAvatar = function () {
	this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`;
};

User.findByUsername = function (username) {
	return new Promise(function (resolve, reject) {
		if (typeof username != "string") {
			reject();
			return;
		}
		usersCollection
			.findOne({ username: username })
			.then(function (userDoc) {
				if (userDoc) {
					// create a new user document, passing in true to receive avatar
					userDoc = new User(userDoc, true);
					// explicitly state what the userDoc should contain to ensure the password is not passed in to the controller
					userDoc = {
						_id: userDoc.data._id,
						username: userDoc.data.username,
						avatar: userDoc.avatar
					};
					resolve(userDoc);
				} else {
					reject();
				}
			})
			.catch(function () {
				reject();
			});
	});
};

module.exports = User;
