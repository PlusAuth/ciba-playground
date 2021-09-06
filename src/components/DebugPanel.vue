<template>
  <div class="expansion-panel debug-panel" :class="{open: open}">
    <div class="expansion-panel-title" @click="open = !open">
      <LogsIcon></LogsIcon>
      Logs
    </div>
    <div class="expansion-panel-content" v-if="open">
      <table class="log-table">
        <thead>
        <tr>
          <th>Action</th>
          <th style="width:100%;">Context</th>
          <th>
            <button @click="clearMessages">CLEAR</button>
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="log in messages" :key="log.time">
          <td :class="log.type">{{ log.action }}</td>
          <td><json-viewer :value="log.context" sort expanded :expand-depth="2"/></td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import {defineComponent, ref, toRefs} from "vue";
import LogsIcon from "../icons/LogsIcon.vue";
import {LogMessages} from "../utils/logger.js";
import {JsonViewer} from "vue3-json-viewer";

export default defineComponent({
  name: "DebugPanel",
  components: {LogsIcon, JsonViewer},
  setup() {
    return {
      open: ref(false),
      messages: LogMessages,
      clearMessages(){
        LogMessages.splice(0, LogMessages.length)
      }
    }
  }
})
</script>

<style>
.debug-panel {
  .expansion-panel-content {
    position: relative;
    padding: 0;
  }
}
.log-table {
  --border-color: #dedede;

  font-size: 12px;
  table-layout: fixed;
  width: 100%;
  max-height: 50%;
  border-collapse: collapse;
  display: block;
  overflow-y: scroll;
  height: 40vh;
  tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  td, th {
    text-align: left;
    padding: 8px 16px;
    border-bottom: 1px solid var(--border-color);

    &:not(:last-of-type){
      border-right: 1px solid var(--border-color);
    }
  }

  th {
    position: sticky;
    background: white;
    top: 0;
    z-index: 1;
    &:first-of-type{
      font-size: 12px;
      width: 20%;
    }
  }
  td {
    &:first-of-type{
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &:nth-of-type(2){
      padding: 0;
    }

    &.error {
      color: var(--error-color);
    }
    &.info {
      color: var(--info-color);
    }
    &.success {
      color: var(--success-color);
    }
    &.warn {
      color: var(--warning-color);
    }
  }

  .jv-container {
    background: none;
    font-size: 12px;
    .jv-code {
      padding: 0;
    }
  }
}
</style>
