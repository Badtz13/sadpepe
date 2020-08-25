/* eslint-disable no-console */

// import dependencies
const firebase = require('firebase/app');
const config = require('./config');


require('firebase/database');

// set up firebase connection
firebase.initializeApp(config);

firebase.database().ref('users').once('value', (snapshot) => {
  const users = snapshot.val();
  const leaveTime = Date.now();
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
  console.log('\x1b[32m%s\x1b[0m', 'complete');
});
