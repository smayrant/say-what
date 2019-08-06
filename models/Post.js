const postsCollection = require("../db").collection("posts");
const ObjectID = require("mongodb").ObjectID;

let Post = function (data, userid) {
	this.data = data;
	this.errors = [];
	this.userid = userid;
};

Post.prototype.sanitizeInput = function () {
	// overwrite the title and body fields if anything other than string data is entered
	if (typeof this.data.title != "string") {
		this.data.title = "";
	}
	if (typeof this.data.body != "string") {
		this.data.body = "";
	}

	// ensure no extra properties are added by explicitly stating what this.data should be
	this.data = {
		title: this.data.title.trim(),
		body: this.data.body.trim(),
		createdData: new Date(),
		author: ObjectID(this.userid)
	};
};

Post.prototype.validate = function () {
	if (this.title == "") {
		this.errors.push("You must provide a title");
	}
	if (this.body == "") {
		this.errors.push("You must provide post content");
	}
};

Post.prototype.create = function () {
	return new Promise((resolve, reject) => {
		this.sanitizeInput();
		this.validate();
		// if there are no errors, save post into DB
		if (!this.errors.length) {
			postsCollection
				.insertOne(this.data)
				.then(() => {
					resolve();
				})
				.catch(() => {
					this.errors.push("Please try again later");
					reject(this.errors);
				});
		} else {
			reject(this.errors);
		}
	});
};

module.exports = Post;
