const mongoose = require('mongoose');

const FileDetailsSchema = new mongoose.Schema({
    fieldname: {type:String},
    originalname: {type:String},
    encoding: {type:String},
    mimetype: {type:String},
    size: {type:Number},
    bucket: {type:String},
    key: {type:String},
    acl: {type:String},
    contentType: {type:String},
    contentDisposition: {type:String},
    storageClass: {type:String},
    serverSideEncryption: {type:String},
    metadata: {},
    location: {type:String},
    etag: {type:String},
    versionId: {type:String},
  }
  , {timestamps: true});

module.exports = mongoose.model('FileDetails', FileDetailsSchema);