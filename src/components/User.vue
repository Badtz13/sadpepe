<template>
  <div class="shadow m-2 w-72 py-2 px-4">
    <div class="flex flex-row">
      <a class="text-lg text-blue-600" target='_blank' :href="'https://dgg.overrustlelogs.net/' + user">{{user}}</a>
      <div v-if="this.data.joined" class="rounded-full bg-green-400 h-3 w-3 ml-2 mt-2"></div>
      <div v-else class="rounded-full bg-red-400 h-3 w-3 ml-2 mt-2"></div>
    </div>
    <div class="mt-4 flex flex-row justify-between">
      <div>{{timeDisplay}}</div>
      <div> {{onlinePercent}}%</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'User',
  props: {
    user: String,
    data: Object,
    uptime: String,
  },
  data() {
    return {
      timeDisplay: 0,
      onlinePercent: 0,
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
  },
  mounted() {
    let totalUnixTime;
    if (this.data.joined) {
      if (this.data.time) {
        totalUnixTime = this.data.time + (Date.now() - this.data.joined);
      } else {
        totalUnixTime = Date.now() - this.data.joined;
      }
    } else {
      totalUnixTime = this.data.time;
    }
    this.timeDisplay = this.prettyPrint(totalUnixTime);

    this.onlinePercent = Math.floor((totalUnixTime / this.uptime) * 100);
  },
};
</script>
