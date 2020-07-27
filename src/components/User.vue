<template>
  <div class="w-full md:w-1/3 lg:w-72 shadow mx-4 md:mx-2 my-2 py-2 px-4">
    <div class="flex flex-row">
      <a class="text-lg text-blue-600" target='_blank' :href="'https://dgg.overrustlelogs.net/' + data.user">{{data.user}}</a>
      <div v-if="data.online" class="rounded-full bg-green-400 h-3 w-3 ml-2 mt-2"></div>
      <div v-else class="rounded-full bg-red-400 h-3 w-3 ml-2 mt-2"></div>
    </div>
    <div class="mt-4 flex flex-row justify-between">
      <div>{{data.data.timeDisplay}}</div>
      <div>{{data.data.average}}</div>
      <div> {{data.data.onlinePercent}}%</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'User',
  props: {
    data: Object,
  },
};
</script>
