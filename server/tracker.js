/* eslint-disable no-console */

// import dependencies
const WebSocket = require('ws');
const firebase = require('firebase/app');

require('firebase/auth');
require('firebase/database');

const config = require('./config.js');

// set up firebase connection
firebase.initializeApp(config);

const reconnectInterval = 10 * 1000;

let userCount = 0;

const startTime = Date.now();

// update the server start time

firebase.database().ref('info').update({
  start: startTime,
}).then(() => {
  firebase.database().ref('info').once('value', (snapshot) => {
    if (!snapshot.val().trackingStart) {
      firebase.database().ref('info').update({
        trackingStart: snapshot.val().start,
      });
    }
  });
});

function prettyTime() {
  const date = new Date();
  return date.toLocaleTimeString().split(' ')[0];
}

function connect() {
  // const ws = new WebSocket('ws://localhost:8080');
  const ws = new WebSocket('wss://chat.destiny.gg/ws');

  // // on socket message ...
  ws.on('message', (data) => {
    const type = data.split(' ')[0];

    if (type === 'NAMES') { // on ws connection, parse names from server
      const content = JSON.parse(data.split('NAMES ')[1]);
      content.users.forEach((user) => {
        userCount += 1;
        // update joined for each user to startTime of server
        firebase.database().ref(`users/${user.nick}`).update({
          joined: startTime,
        });
      });
      console.log('\x1b[34m%s\x1b[0m', `${prettyTime()}: ${userCount} users found...`);
    } else if (type === 'JOIN') { // user joined
      const content = JSON.parse(data.split('JOIN ')[1]);
      userCount += 1;
      const joinedTime = Date.now();
      firebase.database().ref(`users/${content.nick}`).update({
        joined: joinedTime,
      });
      console.log('\x1b[32m%s\x1b[0m', `${prettyTime()}: ${userCount} + ${content.nick}`);
    } else if (type === 'QUIT') { // user quit
      const content = JSON.parse(data.split('QUIT ')[1]);
      userCount -= 1;
      const leaveTime = Date.now();

      firebase.database().ref(`users/${content.nick}`).once('value').then((snapshot) => {
        if (snapshot.val().joined) {
          let userTime = 0;

          if (snapshot.val().time) {
            userTime = snapshot.val().time;
          }
          userTime += (leaveTime - snapshot.val().joined);

          firebase.database().ref(`users/${content.nick}`).update({
            joined: null,
            time: userTime,
          });
        }
      });

      // fetch user data
      // if they have a joined time
      // calculate time between leaveTime and the joined time
      // time += calculated diff

      console.log('\x1b[31m%s\x1b[0m', `${prettyTime()}: ${userCount} - ${content.nick}`);

      // other message types ...
    } else if (type === 'MSG' || type === 'BROADCAST' || type === 'MUTE' || type === 'BAN') {
      // do nothin
    } else {
      console.log(data);
    }
  });

  ws.on('open', () => {
    console.log('\x1b[32m%s\x1b[0m', 'Socket connection established');
  });
  ws.on('close', () => {
    console.log('\x1b[31m%s\x1b[0m', 'Socket connected failed');
    // eslint-disable-next-line no-use-before-define
    setTimeout(cleanup, reconnectInterval);
  });
}

function cleanup() {
  // re-calculate old times to fix any duplication issues
  firebase.database().ref('users').once('value', (snapshot) => {
    const users = snapshot.val();
    const leaveTime = Date.now();
    if (users) {
      Object.keys(users).forEach((userKey) => {
        const user = users[userKey];
        if (user.joined) {
          let time;
          if (user.time) {
          // eslint-disable-next-line prefer-destructuring
            time = user.time;
          } else {
            time = 0;
          }
          firebase.database().ref(`users/${userKey}`).update({
            joined: null,
            time: time + (leaveTime - user.joined),
          });
        }
      });
    }
    console.log('\x1b[32m%s\x1b[0m', 'Cleanup complete');
    connect();
  });
}

cleanup();
