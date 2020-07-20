<template>
  <div class="about">
    <!-- <h1>{{ user }}</h1> -->
    <pre>{{ results }}</pre>
  </div>
</template>
<script>
import * as firebase from 'firebase/app';
import 'firebase/database';

export default {
  name: 'Data',
  data() {
    return {
      results: {},
      user: this.$route.params.user,
    };
  },
  mounted() {
    firebase
      .database()
      .ref(`/users/${this.user}`)
      .once('value', (snapshot) => {
        this.results = JSON.stringify(snapshot.val());
      });
  },
};
</script>
