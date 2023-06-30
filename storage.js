const AWS = require('aws-sdk');
const fs = require('fs');

// Configure AWS SDK with your credentials and region
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION
});

// Create an S3 client
const s3 = new AWS.S3();

// Function to upload a file to S3
const uploadFileToS3 = (file) => {

  return new Promise((resolve, reject) => {
    const content = file.data;
    let DateNow = Date.now();
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: DateNow+"---"+file.originalname,
      Body: content,
      ACL: process.env.S3_ACL
    };
  
    s3.upload(uploadParams, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          Location: data.Location,
          DateNow
        });
      }
    });
  });
};

// Function to read file contents from S3
const readFileFromS3 = (fileName) => {
  return new Promise((resolve, reject) => {
    const downloadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName
    };

    s3.getObject(downloadParams, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Body.toString());
      }
    });
  });
};

module.exports = {
    uploadFileToS3,
    readFileFromS3
}