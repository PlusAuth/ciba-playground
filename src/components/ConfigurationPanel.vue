<template >
  <div class="expansion-panel configuration-panel" :class="{open: open}">
    <div class="expansion-panel-title" @click="open = !open" >
      <SettingsIcon></SettingsIcon>
      Configuration
    </div >
    <div class="expansion-panel-content" v-if="open" >
      <div class="input-group" >
        <label >Issuer URL:</label >
        <input type="text" v-model="issuer" >
      </div >
      <div class="input-group" >
        <label >Client ID:</label >
        <input type="text" v-model="client_id" >
      </div >
      <div class="input-group" >
        <label >Client Secret:</label >
        <input type="text" v-model="client_secret" >
      </div >
    </div >
  </div >
</template >

<script >
import {toRefs} from "vue";
import {CONFIG} from "../state.js";
import SettingsIcon from "../icons/SettingsIcon.vue";

export default {
  name: "ConfigurationPanel",
  components: {SettingsIcon},
  data() {
    return {
      open: false,
      ...toRefs(CONFIG),
    }
  },
  watch: {

  },
}
</script >

<style >

.configuration-panel{
  label {
    font-weight: bold;
  }

  .content {
    padding: 8px 16px;
  }
}
</style >
