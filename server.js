require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connUri = process.env.MONGO_LOCAL_CONN_URL;
let PORT = process.env.PORT || 5000;
const app = express();
const Coordinate = require('./Model/coordinate');
const File = require('./Model/file');
const FileDetails = require('./Model/fileDetails');
const csv = require('csvtojson');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { uploadFileToS3, readFileFromS3 } = require('./storage');
const AWS = require('aws-sdk');
const { encryptData, decryptData, generateIv } = require('./aes');

// Configure AWS SDK with your credentials and region
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.promise = global.Promise;
mongoose.connect(connUri, { useNewUrlParser: true});

const connection = mongoose.connection;
connection.once('open', () => console.log('MongoDB connection established successfully!'));
connection.on('error', (err) => {
    console.log("MongoDB connection error." + err);
    process.exit();
});

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    acl: process.env.S3_ACL,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: function (req, file, cb) {
        cb(null, { 
          fieldName: file.fieldname,
          state: req.query.state
        });
    },
    key: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
  })
});


app.get('/', async (req, res) => {
    res.status(200).send({message: "Welcome to BSedunet backend!"})
});

async function encryptAndStoreToBlockChain(fileDetails) {
  let fileProp = fileDetails.key.split('.');
  return await readFileFromS3(fileDetails.key)
  .then(async (fileContents) => {
    return await encryptData({
      data: fileContents
    })
    .then(async (data)=> {
      let hash = await generateIv(data.key);
      let uploadResp = await uploadFileToS3({
        path: `${'./'+hash + '.' + fileProp[1]}`,
        data: data.encrypted,
        originalname: hash
      });
      let contractAddress = uploadResp.DateNow.toString();
      let fileObj = new File({
        name: fileProp[0],
        extension: fileProp[1],
        metadata: fileDetails.metadata,
        key: data.key,
        encryptedLink: uploadResp.Location,
        contractAddress,
        state: fileDetails.metadata.state
      })
      let fileSaveResp = await fileObj.save();
      return fileSaveResp;
    })
    .catch((error) => {
      return error
    });;
  })
  .catch((error) => {
    return error
  });
};


// API route to handle file upload
app.post('/uploadAndEncryptToBlockChain', upload.single('file'), async (req, res) => {
  let fileDetailsObj = new FileDetails(req.file);
  let fileDetailsSaveResp = await fileDetailsObj.save();
  let encryptAndSaveResp = await encryptAndStoreToBlockChain(fileDetailsSaveResp);
  res.send(encryptAndSaveResp);
});

app.post('/decryptFileAndStoreToMongo', async (req, res) => {
  let fileIds = req.body.data;
  let coordinatesSave = [];
  fileIds.forEach(async (item) => {
    let file = await File.findById(item.fileId);
    let hash = await generateIv(file.key);
    let keyPath = file.contractAddress + '---' + hash;
    await readFileFromS3(keyPath)
    .then(async (fileContents) => {
      let decryptedContent = await decryptData({id: file.key, data: fileContents});
      if(file.extension === 'csv'){
        let csvData = decryptedContent.decryptedData.toString();
        await csv({flatKeys:true})
        .fromString(csvData)
        .subscribe(async (jsonObj)=>{
          let checkCoordinate = await Coordinate.find({name: jsonObj.Name});
          if(checkCoordinate.length === 0){
            let coordinateObj = new Coordinate({
              name: jsonObj.Name,
              latitude: jsonObj.Latitude,
              longitude: jsonObj.Longitude,
              state: file.state,
              description: jsonObj.Description,
              city: jsonObj.City,
            });
            await coordinateObj.save()
            .then((coordinateSave) => {
              coordinatesSave.push(coordinateSave);
            })
            .catch((error) => {
              coordinatesSave.push(error);
            });
          }
        });
      }
      if(file.extension === 'xlsx'){
        console.log('xlsx');
      }
      await File.findByIdAndUpdate(item.fileId, {status: 'DECRYPTED'});
      res.status(200).send(coordinatesSave);
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error reading file' , error});
    });
  });
});

app.get('/fetchCoordinates', async (req, res) => {
  let coordinates = await Coordinate.find(req.query);
  let coordinatesArr = [];
  coordinates.map((item, ind) => {
    coordinatesArr.push({
      id: ind+1,
      name: item.name,
      description: item.description,
      latitude: item.latitude,
      longitude: item.longitude
    });
  });
  res.status(200).send(coordinatesArr);
});

app.get('/fetchOptions', async (req, res) => {
  let files = await File.find();
  let catNames = [];
  let optionsObj = []
  files.map((item, index) => item.status === "DECRYPTED" ? catNames.push(item.state): null);
  let uniqueOptions = catNames.filter((item, i, ar) => ar.indexOf(item) === i);
  uniqueOptions.map((item, index) => optionsObj.push({
    id: index,
    value: item,
    label: item,
    selected: false
  }));
  res.status(200).send(optionsObj);
});

app.get('/fetchUndecryptedFiles', async (req, res) => {
  let files = await File.find();
  let filtered = files.filter(item => item.status==="ENCRYPTED");
  res.status(200).send(filtered);
});

app.listen(PORT, () => console.log('Server running on '+PORT));
