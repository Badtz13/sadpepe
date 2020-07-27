<template>
  <div class="home">

    <!-- informational heading -->
    <div class="container mx-auto w-64 my-4">

      <!-- site heading -->
      <p class="text-2xl text-blue-700 text-center mb-1">Sad Pepe DGG tracking</p>

      <!-- online filter  -->
      <div class="flex flex-row justify-center">
        <label for="online" class="text-md text-blue-600">Only show online users</label>
        <input type="checkbox" name="online" id="online" v-model="onlineOnly" class="ml-2 mt-1" />
      </div>

      <!-- search filter  -->
      <div class="w-full mx-auto flex justify-center">
        <input
          v-model="currentFilter"
          autofocus="autofocus"
          class="border rounded py-1 px-2 m-2 focus:outline-none text-blue-600"
        />
      </div>

      <!-- information display  -->
      <div class="text-sm text-blue-500 flex justify-around">
        <div>Users tracked: {{this.users.length}}</div>
        <div>Users online: {{this.users.filter(user => user.online).length}}</div>
      </div>
      <p class="text-sm text-blue-500 text-center">
        Tracking started: {{this.trackingStart}}
      </p>
      <p class="text-sm text-blue-500 text-center">
        Total uptime: {{prettyPrint(this.trackedTime)}}
      </p>

      <!-- github  -->
      <a
        class="text-sm text-blue-500 text-center block"
        href="https://github.com/Badtz13/sadpepe"
        target="_blank"
      >
        Report Issues / Contribute
      </a>
    </div>

    <!-- display users  -->
    <div v-if="users.length !== 0" class="flex flex-row flex-wrap justify-center">
      <user v-for="user in shownUsers" :key="user.user" :data="user" />
    </div>

    <!-- loading animation -->
    <div v-else class="flex justify-center mt-12">
      <Donut />
    </div>
  </div>
</template>

<script>
import 'firebase/database';
import * as firebase from 'firebase/app';
import User from '@/components/User.vue';
import Donut from '@/components/Donut.vue';

export default {
  name: 'home',
  components: {
    User,
    Donut,
  },
  data() {
    return {
      users: [], // list of users and their info to be shown
      serverStart: '', // time the tracking server was restarted
      trackingStart: '', // time tracking first began
      trackedTime: '', // amount of time tracked in total
      onlineOnly: true, // if users should be filtered by online, based on checkbox
      displayCount: 50, // number of users to show on the page, scrolling to bottom adds to this
      currentFilter: '', // current value and filter for search box
    };
  },
  methods: {
    // converts milliseconds to a string in the format xd yh zm
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

    // calculates time stats given a user's data
    calculateTime(data) {
      const daysSinceStart = Math.floor(this.trackedTime / 86400000);

      let totalUnixTime;

      // if the user is currently connected
      // make sure to add the time between when they joined and now to their total
      if (data.joined) {
        if (data.time) {
          totalUnixTime = data.time + (Date.now() - data.joined);
        } else {
          totalUnixTime = Date.now() - data.joined;
        }
      } else {
        totalUnixTime = data.time;
      }
      return {
        timeDisplay: this.prettyPrint(totalUnixTime),
        totalUnixTime,
        onlinePercent:
          Math.round(
            (totalUnixTime / (Date.now() - Date.parse(this.trackingStart)))
              * 10000,
          ) / 100,
        average: `${Math.floor(totalUnixTime / daysSinceStart / 3600000)} h/d`,
      };
    },
  },
  computed: {
    // filters users shown based on online checkbox, search box and display count
    shownUsers() {
      return this.users
        .filter((user) => {
          if (this.onlineOnly) {
            if (!user.online) {
              return false;
            }
          }
          if (
            !user.user
              .toLowerCase()
              .startsWith(this.currentFilter.toLowerCase())
          ) {
            return false;
          }
          return true;
        })
        .slice(0, this.displayCount);
    },
  },
  mounted() {
    // fetch server info (runs once)
    firebase
      .database()
      .ref('/info')
      .once('value', (snapshot) => {
        this.serverStart = new Date(snapshot.val().start).toLocaleString();
        this.trackingStart = new Date(
          snapshot.val().trackingStart,
        ).toLocaleString();
        this.trackedTime = Date.now() - snapshot.val().trackingStart;
      });

    // fetch user data (runs each time db changes)
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
        this.users = tempUsers.sort(
          (a, b) => b.data.totalUnixTime - a.data.totalUnixTime,
        );
      });

    // add to display count when page is scrolled to the bottom
    window.onscroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
        console.log('Bottom of page');
        this.displayCount += 50;
      }
    };
  },
};
</script>
