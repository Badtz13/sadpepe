/* eslint-disable no-console */

// import dependencies
const WebSocket = require('ws');
const firebase = require('firebase/app');

require('firebase/auth');
require('firebase/database');

const config = require('./config.js');

// set up firebase connection
firebase.initializeApp(config);

// update the server start time
const startTime = Date.now();
firebase.database().ref('info').update({
  start: startTime,
});

// connect to dgg socket
const ws = new WebSocket('wss://www.destiny.gg/ws');

let userCount = 0;

// null out all old join times
firebase
  .database()
  .ref('users')
  .once('value', (snapshot) => {
    if (snapshot.val()) {
      Object.keys(snapshot.val()).forEach((user) => {
        firebase.database().ref(`users/${user}`).child('joined').remove();
      });
    }
  });

// on socket message ...
ws.on('message', (data) => {
  const type = data.split(' ')[0];

  // socket sends list of all users on first connection
  if (type === 'NAMES') {
    const content = JSON.parse(data.split('NAMES ')[1]);
    content.users.forEach((element) => {
      userCount += 1;
      firebase.database().ref(`users/${element.nick}`).update({
        joined: startTime,
      });
    });
    console.log(userCount);

    // if a user joined ...
  } else if (type === 'JOIN') {
    userCount += 1;
    const content = JSON.parse(data.split('JOIN ')[1]);
    firebase.database().ref(`users/${content.nick}`).update({
      joined: Date.now(),
    });
    console.log(userCount);

    // if a user quit ...
  } else if (type === 'QUIT') {
    userCount -= 1;
    const content = JSON.parse(data.split('QUIT ')[1]);
    const leaveTime = Date.now();
    firebase.database().ref(`users/${content.nick}`).once('value').then((snapshot) => {
      const { joined } = snapshot.val();
      let time;
      if (snapshot.val().time) {
        // eslint-disable-next-line prefer-destructuring
        time = snapshot.val().time;
      } else {
        time = 0;
      }
      firebase.database().ref(`users/${content.nick}`).update({
        joined: null,
        time: time + (leaveTime - joined),
      });
    });
    console.log(userCount);

    // other message types ...
  } else {
    // console.log(data);
  }
});
