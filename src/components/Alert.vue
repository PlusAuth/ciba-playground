<template>
  <div
      class="alert"
      :class="'alert-'+ options.color"
      v-if="model"
      @mouseenter="clearCloseTimer"
      @mouseleave="initCloseTimer"
  >
    <div class="alert-wrapper">
      <div class="alert-content">
        <div class="alert-message">
          <div
              class="alert-message-title"
              v-text="text?.replaceAll('_', ' ')"
          />
          <div v-if="message"
               class="alert-message-subtitle"
               v-text="message"
          />
        </div>
        <CloseIcon
            v-if="options.closable"
            class="close-icon"
            color="white"
            size="32"
            @click="close"
        />
      </div>
      <div v-if="messages.length > 1"
           class="alert-index"
      >
        1 of {{ messages.length }}
      </div>
    </div>
  </div>
</template>

<script>

import {defineComponent, reactive, ref, toRefs, watch } from "vue";
import CloseIcon from "../icons/CloseIcon.vue";

const defaultOptions = Object.freeze({
  timeout: 2500,
  color: 'error',
  closable: true
});
const data = reactive({
  messages: [],
  model: false,
  message: null,
  text: '',
  options: {...defaultOptions}
})

function applyOptions(text, message, options) {
  let reopen = false;
  if (data.model) {
    data.model = false;
    reopen = true;
  }

  setTimeout(() => {
    data.text = text;
    data.message = message;
    data.options = Object.assign({...defaultOptions}, options);
    data.model = true;
  }, reopen ? 200 : 0);
}

export function $showAlert(text, message, options) {
  const existingIndex = data.messages.findIndex(m => m.text === text && m.message === message);
  data.messages.splice(existingIndex, 1);
  data.messages.unshift({
    text,
    message,
    options: Object.assign({...defaultOptions}, options)
  });
  applyOptions(text, message, options);
}

export function $closeAlert() {
  data.messages.shift();
  if (data.messages.length === 0) {
    data.model = false;
  } else {
    const msg = data.messages[0];
    applyOptions(msg.text, msg.message, msg.options);
  }
}

export default defineComponent({
  name: 'Alert',
  components: {CloseIcon},
  setup() {
    const dataRef = toRefs(data)
    const activeTimer = ref()

    function clearCloseTimer() {
      window.clearTimeout(activeTimer.value)
    }

    function initCloseTimer() {
      clearCloseTimer()
      if (!data.model || !data.options.timeout) {
        return
      }

      activeTimer.value = window.setTimeout(() => {
        data.model = false
      }, Number(data.options.timeout))
    }

    watch([dataRef.model, toRefs(data.options).timeout], () => {
      initCloseTimer()
    }, {flush: 'sync'})
    return {
      ...dataRef,
      close: $closeAlert,
      initCloseTimer,
      clearCloseTimer,
    }
  }
});
</script>

<style>
.alert {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 4px;
  z-index: 10;
  padding: 16px 48px 16px 24px;
  box-shadow: 0px 0px 4px 0px #ccc;
  max-width: 40%;

  &-wrapper {
  }

  &-content {

  }

  &-message {
    &-title {
      font-size: 18px;
      font-weight: bold;
      text-transform: capitalize;
    }

    &-subtitle {
      font-size: 16px;
      margin-top: 8px;
    }
  }

  &-error {
    background: var(--error-color);
    color: white;
  }

  &-success {
    background: var(--success-color);
    color: white;
  }

  &-info {
    background: var(--info-color);
    color: white;
  }
  &-warn {
    background: var(--warning-color);
    color: white;
  }

  .close-icon {
    padding: 4px;
    position: absolute;
    cursor: pointer;
    border-radius: 50%;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);

    &:hover {
      background: rgba(225, 225, 225, 0.3);
    }
  }
}
</style>
