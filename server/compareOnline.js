/* eslint-disable no-console */

// import dependencies
const WebSocket = require('ws');

const dgg = new WebSocket('wss://chat.destiny.gg/ws');
const vgg = new WebSocket('wss://www.vaush.gg/ws');

let dCount = 0;
let dLast = 0;
let vCount = 0;
let vLast = 0;

function handleMessage(data) {
  let counter = 0;
  const type = data.split(' ')[0];
  if (type === 'NAMES') {
    const content = JSON.parse(data.split('NAMES ')[1]);
    counter += content.users.length;
    return counter;
  } if (type === 'JOIN') {
    return 1;
  } if (type === 'QUIT') {
    return -1;
  }
  return 0;
}

dgg.addEventListener('message', (data) => {
  dCount += handleMessage(data.data);
});

vgg.addEventListener('message', (data) => {
  vCount += handleMessage(data.data);
});

setInterval(() => {
  console.log('---');
  console.log(`DGG: ${dCount} ${dCount - dLast}`);
  console.log(`VGG: ${vCount} ${vCount - vLast}`);

  dLast = dCount;
  vLast = vCount;
}, 5000);
