const AWS = require("aws-sdk");
const uuid = require("uuid/v1");
const requireLogin = require("../middlewares/requireLogin");
const keys = require("../config/keys");

const s3 = new AWS.S3({
	accessKeyId: keys.accessKeyId,
	secretAccessKey: keys.secretAccessKey
});

module.exports = app => {
	app.get("/api/upload", requireLogin, (req, res) => {
		s3.getSignedUrl(
			"putObject",
			{
				Bucket: "blog-bucket-569",
				ContentType: "image/jpeg",
				Key: `${req.user.id}/${uuid()}.jpeg`
			},
			(err, url) => {
				res.send({ key, url });
			}
		);
	});
};
