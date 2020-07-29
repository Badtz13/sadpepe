<template>
  <div class="border mt-1">
    <div
      :style="{opacity:tooltipShown ? '1' : '0'}"
      class=" tooltip absolute ml-1"
    >
      {{this.graph[this.hoveredBar]}}
    </div>
    <svg class="w-full">
      <rect
        v-for="bar in graph.keys()"
        :key="bar"
        @mouseenter=showTooltip(bar)
        @mouseleave=hideTooltip()
        :x="8 * bar + 'px'"
        y="0"
        width="8px"
        :height="(graph[bar] / totalUsers) * 100 + '%'"
        class="cursor-pointer"
        :style="{fill:hoveredBar === bar ? 'lightblue' : '#4299e1'}"
      />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'OnlineGraph',
  props: {
    onlineUsers: Number,
    totalUsers: Number,
  },
  data() {
    return {
      graph: [],
      tooltipShown: false,
      hoveredBar: Number,
    };
  },
  methods: {
    showTooltip(bar) {
      this.hoveredBar = bar;
      this.tooltipShown = true;
    },
    hideTooltip() {
      this.hoveredBar = null;
      this.tooltipShown = false;
    },
  },
  mounted() {
    setInterval(() => {
      if (this.onlineUsers) {
        if (this.graph.length === 32) {
          this.graph.shift();
        }
        this.graph.push(this.onlineUsers);
        // this.graph.push(Math.floor(Math.random() * this.onlineUsers * 5));
      }
    }, 1000);
  },
};
</script>

<style scoped>
svg {
  height: 64px;
  transform: scaleY(-1);
}
.tooltip {
  transition: opacity .25s ease-out;
}
</style>
