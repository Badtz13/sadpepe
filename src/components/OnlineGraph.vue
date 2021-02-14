<template>
  <div class="border mt-1 graphBox mx-auto">
    <div class="absolute flex flex-row justify-between displayContainer">
      <div
        :style="{opacity:tooltipShown ? '1' : '0'}"
        class="tooltip mx-1 text-blue-800"
      >
        {{this.tooltipText}} users
      </div>

      <div class="mx-1 text-blue-800">
        {{change}}
      </div>
    </div>

    <svg>
      <rect
        v-for="bar in graph.keys()"
        :key="bar"
        @mouseenter="showTooltip(graph[bar])"
        @mouseleave="tooltipShown = false"
        :x="8 * bar + 'px'"
        y="0"
        width="8px"
        :height="(graph[bar] / totalUsers) * 100 + '%'"
        class="cursor-pointer rect"
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
    site: String,
  },
  data() {
    return {
      graph: [],
      tooltipShown: false,
      tooltipText: '',
      currentSite: this.site,
    };
  },
  methods: {
    showTooltip(count) {
      this.tooltipText = count;
      this.tooltipShown = true;
    },
  },
  computed: {
    change() {
      if (this.graph.length > 0) {
        const diff = this.graph[this.graph.length - 1] - this.graph[0];
        return diff >= 0 ? `+${diff}/${this.graph.length}s` : `${diff}/${this.graph.length}s`;
      }
      return null;
    },
  },
  mounted() {
    setInterval(() => {
      if (this.onlineUsers) {
        if (this.graph.length === 30) {
          this.graph.shift();
        }
        this.graph.push(this.onlineUsers);
        // this.graph.push(this.graph.length + 4000);
        // this.graph.push(Math.floor(Math.random() * this.onlineUsers * 5));
      }
      if (this.site !== this.currentSite) {
        this.currentSite = this.site;
        this.graph = [];
        this.$forceUpdate();
      }
    }, 1000);
  },
};
</script>

<style scoped>
.graphBox{
    width: 242px;
}
.displayContainer {
  width: 240px;
}
svg {
  height: 64px;
  width: 240px;
  transform: scaleY(-1);
}
.rect {
  fill: rgba(66, 153, 225,.6);
}

.rect:hover {
  fill: rgba(66, 153, 225, .9);
}
.tooltip {
  transition: opacity 0.25s ease-out;
}
</style>
