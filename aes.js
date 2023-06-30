const crypto = require('crypto');
const ecnryption_method = 'aes-256-cbc';

// Encrypt data
async function encryptData({data}) {
  let random = crypto.randomBytes(16);
  let id = random.toString('hex');
  let hash = await generateIv(id);
  const cipher = crypto.createCipheriv(ecnryption_method, id, hash)
  let encrypted = Buffer.from(cipher.update(data, 'utf8', 'hex') + cipher.final('hex'));
  return { encrypted:encrypted.toString('utf8'), key: id };
}

// Decrypt data
async function decryptData({id, data}) {
  let hash = await generateIv(id);
  const decipher = crypto.createDecipheriv(ecnryption_method, id, hash)
  let decryptedData = decipher.update(data, 'hex', 'utf8') +  decipher.final('utf8');
  return {decryptedData};
}

async function generateIv(id) {
  return crypto.createHash('sha512').update(id).digest('hex').substring(0, 16);
}

module.exports = { encryptData, decryptData, generateIv };

// For testing
// encryptData({data: "Hello World"}).then(async (data) => {
//   await decryptData({id: data.key, data: data.encrypted})
//   .then((data) => {
//     console.log(data);
//   })
//   .catch(err => {
//     console.log(err);
//   })
// });