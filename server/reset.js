/* eslint-disable no-console */

// import dependencies
const firebase = require('firebase/app');

require('firebase/auth');
require('firebase/database');

const config = require('./config.js');

// set up firebase connection
firebase.initializeApp(config);

// delete all info
firebase.database().ref('users').remove().then(() => firebase.database().ref('info').remove().then(() => console.log('\x1b[32m%s\x1b[0m', 'complete')));
