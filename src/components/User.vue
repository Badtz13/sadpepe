<template>
  <!-- user tile  -->
  <div class="w-full md:w-1/3 lg:w-72 shadow mx-4 md:mx-2 my-2 py-2 px-4">
    <div class="flex flex-row justify-between">
      <div class="flex flex-row">
        <a class="text-lg text-blue-600" target='_blank' :href="'https://dgg.overrustlelogs.net/' + data.user">{{data.user}}</a>
        <!-- online / offline dot -->
        <div v-if="data.online" class="rounded-full bg-green-400 h-3 w-3 ml-2 mt-2"></div>
        <div v-else class="rounded-full bg-red-400 h-3 w-3 ml-2 mt-2"></div>
      </div>
      <div v-if="data.rank" class="text-gray-600">#{{data.rank}} </div>
    </div>
    <!-- user stats  -->
    <div class="mt-4 flex flex-row justify-between">
      <div>{{data.data.timeDisplay}}</div>
      <div>{{data.data.average}}</div>
      <div>{{onlinePercent}}%</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'User',
  props: {
    data: Object,
    startTime: Number,
  },
  computed: {
    onlinePercent() {
      const prettyDisplay = Math.round(
        (this.data.data.totalUnixTime / (Date.now() - this.startTime)) * 100,
      );
      return ((prettyDisplay > 100) ? 100 : prettyDisplay);
    },
  },
};
</script>
