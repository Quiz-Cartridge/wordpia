<template>
  <Main />
</template>

<script lang="ts">
import Vue from 'vue'
import Main from "~/components/Main.vue"
export default Vue.extend({
  components: { Main }
})
</script>

<style>
.relative {
  position: relative;
}
.absolute {
  position: absolute;
}
body {
  font-family: 'SquareFont';
}
</style>
