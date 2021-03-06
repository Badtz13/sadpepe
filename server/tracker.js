/* eslint-disable no-console */

// import dependencies
const WebSocket = require('ws');
const firebase = require('firebase/app');

require('firebase/auth');
require('firebase/database');

const config = require('./config.js');

// set up firebase connection
firebase.initializeApp(config);

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

function connect(path, link) {
  const ws = new WebSocket(link);
  let userCount = 0;

  // // on socket message ...
  ws.on('message', (data) => {
    const type = data.split(' ')[0];

    if (type === 'NAMES') { // on ws connection, parse names from server
      const content = JSON.parse(data.split('NAMES ')[1]);
      content.users.forEach((user) => {
        userCount += 1;
        // update joined for each user to startTime of server
        firebase.database().ref(`users/${path}/${user.nick}`).update({
          joined: startTime,
        });
      });
      console.log('\x1b[34m%s\x1b[0m', `${path}: ${userCount} users found...`);
    } else if (type === 'JOIN') { // user joined
      const content = JSON.parse(data.split('JOIN ')[1]);
      userCount += 1;
      const joinedTime = Date.now();
      firebase.database().ref(`users/${path}/${content.nick}`).update({
        joined: joinedTime,
      });
      console.log('\x1b[32m%s\x1b[0m', `${path}: ${userCount} + ${content.nick}`);
    } else if (type === 'QUIT') { // user quit
      const content = JSON.parse(data.split('QUIT ')[1]);
      userCount -= 1;
      const leaveTime = Date.now();

      firebase.database().ref(`users/${path}/${content.nick}`).once('value').then((snapshot) => {
        if (snapshot.val().joined) {
          let userTime = 0;

          if (snapshot.val().time) {
            userTime = snapshot.val().time;
          }
          userTime += (leaveTime - snapshot.val().joined);

          firebase.database().ref(`users/${path}/${content.nick}`).update({
            joined: null,
            time: userTime,
          });
        }
      });

      // fetch user data
      // if they have a joined time
      // calculate time between leaveTime and the joined time
      // time += calculated diff

      console.log('\x1b[31m%s\x1b[0m', `${path}: ${userCount} - ${content.nick}`);

      // other message types ...
    } else if (type === 'MSG' || type === 'BROADCAST' || type === 'MUTE' || type === 'BAN') {
      // do nothin
    } else {
      console.log(`${path}: ${data}`);
    }
  });

  ws.on('open', () => {
    console.log('\x1b[32m%s\x1b[0m', `${path}: Socket connection established`);
  });

  function handleClose() {
    console.log('\x1b[31m%s\x1b[0m', `${path}: Socket connection closed`);
    ws.close();
    ws.terminate();
    ws.removeAllListeners();
    // eslint-disable-next-line no-use-before-define
    setTimeout(() => { init(path, link); }, 1000);
  }

  ws.on('close', () => {
    ws.removeAllListeners();
    handleClose();
  });


  ws.on('error', () => {
    ws.removeAllListeners();
    handleClose();
  });

  ws.on('unexpected-response', () => {
    ws.removeAllListeners();
    handleClose();
  });
}

function init(path, ws) {
  // re-calculate old times to fix any duplication issues
  firebase.database().ref(`users/${path}`).once('value', (snapshot) => {
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
          firebase.database().ref(`users/${path}/${userKey}`).update({
            joined: null,
            time: time + (leaveTime - user.joined),
          });
        }
      });
    }
    console.log('\x1b[32m%s\x1b[0m', `${path}: Cleanup complete`);
    connect(path, ws);
  });
}

function startup() {
  init('dgg', 'wss://chat.destiny.gg/ws');
}

startup();
