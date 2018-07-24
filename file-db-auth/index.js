// vim: tabstop=2 shiftwidth=2 expandtab
//

'use strict'

const JsonDB = require('node-json-db');
const crypto = require("crypto");

class fileDBAuth {

  constructor(dbPath) {

    this.dbPath = dbPath;
    // Save after each push = true, save in human readable format = true
    this.db = new JsonDB(dbPath + '/config.json', true, true);

    // Check DB Version
    try {
      let ver = this.db.getData('/dbVersion');
      if (ver !== '0') {
        throw (new Error('version mismatch'))
      }
    } catch(e) {
      //this.db.delete('/');
      // Initialize Database
      this.db.push('/dbVersion', '0');
      // TODO need to hash to keep safe
      let password = process.env.DEFAULT_PASSWORD || crypto.randomBytes(3*4).toString('base64');
      this.db.push('/users', {
        'admin': {
          password,
          'hashed': false,
          'admin': true,
        },
      }, false);
      let privateKey = process.env.DEFAULT_PRIVATE_KEY || crypto.randomBytes(3*4).toString('base64');
      // TODO need to keep safe
      this.db.push('/privateKey', this.privateKey);
    }

    this.privateKey = crypto.randomBytes(3*4).toString('base64');
    // If we passed in the private key then use it instead
    if (process.env.PRIVATE_KEY) {
      this.privateKey = process.env.PRIVATE_KEY;
    }
    // Override any generated or passed in keys if there's one in the DB
    try {
      dbPrivateKey = this.db.getData('/privateKey');
      // if no exception so far then we use it here
      this.privateKey = dbPrivateKey;
    } catch(e) {}

    this.users = {};
    try { this.users = this.db.getData('/users'); } catch(e) {}

  }

  getPrivateKey() {
    return this.privateKey;
  }

  getUserInfo(username) {
    return new Promise((resolve, reject) => {
      let userInfo = this.users[username];
      if (userInfo) {
        return resolve({
          'username': username,
          'hashed': userInfo.hashed,
          'admin': userInfo.admin,
        });
      }
      return reject(new Error('Invalid username'));
    });
  }

  authenticate(username, password) {
    return this.getUserInfo(username)
    .then((userInfo) => {
      if (userInfo && this.users[username] && this.users[username].password == password) {
        return(userInfo);
      }
      throw (new Error('Invalid Password'));
    });
  }

}

module.exports = fileDBAuth;

