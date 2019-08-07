const postsCollection = require("../db").collection("posts");
const User = require("./User");
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
		createdDate: new Date(),
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

Post.reusablePostQuery = function (uniqueOperations) {
	return new Promise(async function (resolve, reject) {
		let aggOperations = uniqueOperations.concat([
			// find a post based on its id and the corresponding user
			{ $lookup: { from: "users", localField: "author", foreignField: "_id", as: "authorDocument" } },
			{
				$project: {
					title: 1,
					body: 1,
					createdDate: 1,
					author: { $arrayElemAt: [ "$authorDocument", 0 ] }
				}
			}
		]);
		let posts = await postsCollection.aggregate(aggOperations).toArray();

		// clean up author property in each post object
		posts = posts.map(function (post) {
			post.author = {
				username: post.author.username,
				avatar: new User(post.author, true).avatar
			};
			return post;
		});
		resolve(posts);
	});
};

// find a post based on its id
Post.findSingleById = function (id) {
	return new Promise(async function (resolve, reject) {
		// if the id isn't a string or a valid MongoDB id, reject and then return
		if (typeof id !== "string" || !ObjectID.isValid(id)) {
			reject();
			return;
		}
		let posts = await Post.reusablePostQuery([ { $match: { _id: new ObjectID(id) } } ]);
		if (posts.length) {
			resolve(posts[0]);
		} else {
			reject();
		}
	});
};

Post.findByAuthorId = function (authorId) {
	return Post.reusablePostQuery([ { $match: { author: authorId } }, { $sort: { createdDate: -1 } } ]);
};

module.exports = Post;
