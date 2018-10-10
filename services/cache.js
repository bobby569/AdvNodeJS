const mongoose = require("mongoose");
const util = require("util");
const client = require("redis").createClient("redis://127.0.0.1:6379");

const exec = mongoose.Query.prototype.exec;
client.hget = util.promisify(client.hget);

mongoose.Query.prototype.cache = function(options = {}) {
	this.useCache = true;
	this.hashKey = JSON.stringify(options.key || "");

	return this;
};

mongoose.Query.prototype.exec = async function() {
	if (!this.useCache) {
		return exec.apply(this, arguments);
	}

	const key = JSON.stringify(
		Object.assign({}, this.getQuery(), {
			collection: this.mongooseCollection.name
		})
	);

	const cacheVal = await client.hget(this.hashKey, key);
	if (cacheVal) {
		const doc = JSON.parse(cacheVal);
		return Array.isArray(doc)
			? doc.map(d => new this.model(d))
			: new this.model(doc);
	}

	const result = await exec.apply(this, arguments);
	client.hset(this.hashKey, key, JSON.stringify(result), "EX", 10);
	return result;
};

module.exports = {
	clearHash(hashKey) {
		client.del(JSON.stringify(hashKey));
	}
};
