<template>
  <!-- placeholder for the donut  -->
  <div></div>
</template>

<script>
export default {
  name: 'Donut',
};
</script>

<style scoped>

/* animation keyframes  */
@keyframes donut-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

div {
  display: inline-block;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #4299e1;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: donut-spin 1.2s linear infinite;
}
</style>
