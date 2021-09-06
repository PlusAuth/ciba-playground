<template>
  <svg class="icon" :style="style" viewBox="0 0 24 24" >
    <path fill="currentColor" d="M21,4H16V20H21V4M14,9H9V20H14V9M7,14H2V20H7V14Z" />
  </svg >
</template>

<script>
import {IconMixin} from "../mixins/icon.js";

export default {
  name: "CellularIcon",
  mixins: [IconMixin],
}
</script>

<style scoped>

</style>
