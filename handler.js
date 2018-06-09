'use strict';

module.exports.hello = (event, context, callback) => {
	console.log("Start Lambda processing", event, context, process);

	const AWS = require('aws-sdk');
	console.log("AWS loaded");

	const S3 = new AWS.S3({
	  signatureVersion: 'v4',
	});
	console.log("S3 loaded");

	const Sharp = require('sharp');
	console.log("Sharp loaded");

	const BUCKET = event.stageVariables.BUCKET;
	const URL = event.stageVariables.URL;

	const key = event.pathParameters.size;
	const match = key.match(/(\d+)x(\d+)/);

	console.log("Site matches: ", key, match, match.length);

	if (!match || match.length != 3) {
		callback(null, {
			statusCode: '404',
			body: 'size not match'
		});
		return;
	}

	const width = parseInt(match[1], 10);
	const height = parseInt(match[2], 10);
	const originalKey = event.pathParameters.image;
	const finalFileName = key + '/' + originalKey;

	if (!originalKey) {
		callback(null, {
			statusCode: '404',
			body: 'image not match'
		});
		return;
	}

	console.log("Loogs good - start", BUCKET, originalKey);

	S3.getObject({Bucket: BUCKET, Key: originalKey}).promise()
		.then(data => Sharp(data.Body)
			.resize(width, height)
			.toFormat('png')
			.toBuffer()
		)
		.then(buffer => S3.putObject({
				Body: buffer,
				Bucket: BUCKET,
				ContentType: 'image/png',
				Key: finalFileName,
			}).promise()
		)
		.then(() => callback(null, {
			statusCode: '301',
			headers: {'location': `${URL}/${key}`},
			body: '',
		})
	)
	.catch(err => callback(err))


/*	const response = {
		statusCode: 200,
		body: JSON.stringify({
			message: 'Go Serverless v1.0! Your function executed successfully!',
			input: event,
		}),
	};

	callback(null, response); */




// Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
