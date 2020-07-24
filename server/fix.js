/* eslint-disable no-console */

// import dependencies
const firebase = require('firebase/app');
const config = require('./config');

const JOINED = 1594745896360;
const TIME = 590178844;

require('firebase/database');

// set up firebase connection
firebase.initializeApp(config);

firebase
  .database()
  .ref('/info')
  .once('value', (snapshot) => {
    const trackedTime = Date.now() - snapshot.val().trackingStart;
    const joinedDiff = Date.now() - JOINED + TIME;
    const timeToAdd = trackedTime - joinedDiff;
    firebase.database().ref('users').once('value', (userSnap) => {
      const users = userSnap.val();
      Object.keys(users).forEach((userKey) => {
        const user = users[userKey];
        if (user.time) {
          // eslint-disable-next-line prefer-destructuring
          if (user.time === TIME) {
            firebase.database().ref(`users/${userKey}`).update({
              time: user.time + timeToAdd,
            });
          }
        }
      });
      console.log('complete');
    });
  });
