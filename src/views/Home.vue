<template>
  <div class="home">
    <div class="container mx-auto w-64 my-4">
      <p class="text-2xl text-blue-700 text-center mb-1">Sad Pepe DGG tracking</p>
      <div class="flex flex-row justify-center">
        <label for="online" class="text-md text-blue-600">Only show online users</label>
        <input type="checkbox" name="online" id="online" v-model="onlineOnly" class="ml-2 mt-1" />
      </div>
      <div class="text-sm text-blue-500 flex justify-around">
        <div>Users tracked: {{Object.keys(this.users).length}}</div>
        <div>Users online: {{onlineUsers.length}}</div>
      </div>
      <p class="text-sm text-blue-500 text-center">Tracking started: {{this.trackingStart}}</p>
      <p class="text-sm text-blue-500 text-center">
        Total uptime: {{prettyPrint(this.trackedTime)}}
      </p>
      <a class="text-sm text-blue-500 text-center block" href="https://github.com/Badtz13/sadpepe" target="_blank">
        Report Issues / Contribute
      </a>
    </div>
    <div class="flex flex-row flex-wrap justify-center">
      <user
        v-for="user in onlineUsers"
        :key="user.user"
        :data="user"
      />
    </div>
  </div>
</template>

<script>
import * as firebase from 'firebase/app';
import 'firebase/database';
import User from '@/components/User.vue';

export default {
  name: 'home',
  components: {
    User,
  },
  data() {
    return {
      users: [],
      serverStart: '',
      trackingStart: '',
      trackedTime: '',
      onlineOnly: true,
      now: Date.now(),
    };
  },
  methods: {
    prettyPrint(milliseconds) {
      let bucket = milliseconds;
      // [['days', 86400000], ['hours', 3600000], ['minutes', 60000], ['seconds', 1000]];
      const days = Math.floor(bucket / 86400000);
      bucket -= days * 86400000;
      const hours = Math.floor(bucket / 3600000);
      bucket -= hours * 3600000;
      const minutes = Math.floor(bucket / 60000);
      bucket -= minutes * 60000;
      const seconds = Math.floor(bucket / 1000);
      bucket -= seconds * 1000;

      let returnString = '';
      if (days > 0) {
        returnString += `${days}d `;
      }
      if (hours > 0) {
        returnString += `${hours}h `;
      }
      if (minutes > 0) {
        returnString += `${minutes}m `;
      }
      if (returnString === '') {
        returnString += `${seconds}s `;
      }
      return returnString;
    },
    calculateTime(data) {
      let totalUnixTime;
      if (data.joined) {
        if (data.time) {
          totalUnixTime = data.time + (this.now - data.joined);
        } else {
          totalUnixTime = this.now - data.joined;
        }
      } else {
        totalUnixTime = data.time;
      }
      return {
        timeDisplay: this.prettyPrint(totalUnixTime),
        totalUnixTime,
        onlinePercent: Math.floor((totalUnixTime / this.trackedTime) * 100),
      };
    },
  },
  computed: {
    onlineUsers() {
      if (this.onlineOnly) {
        return this.users.filter(user => user.online);
      }
      return this.users;
    },
  },
  mounted() {
    firebase
      .database()
      .ref('/info')
      .once('value', (snapshot) => {
        this.serverStart = new Date(snapshot.val().start).toLocaleString();
        this.trackingStart = new Date(
          snapshot.val().trackingStart,
        ).toLocaleString();
        this.trackedTime = this.now - snapshot.val().trackingStart;
      });

    firebase
      .database()
      .ref('/users/')
      .on('value', (settingsSnapshot) => {
        const tempUsers = [];
        const usersResult = settingsSnapshot.val();
        const userKeys = Object.keys(settingsSnapshot.val());
        userKeys.forEach((user) => {
          tempUsers.push({
            user,
            data: this.calculateTime(usersResult[user]),
            online: !!usersResult[user].joined,
          });
        });
        this.users = tempUsers.sort((a, b) => b.data.totalUnixTime - a.data.totalUnixTime);
        console.log(this.users.slice(0, 5));
      });
  },
};
</script>
