<template>
  <div class="app end-user-app">
    <header class="app-header">END-USER DEVICE</header>
    <section class="app-section-info">
      <p>Assuming bank or auth provider application is installed on user's device.</p>
    </section>
    <section class="app-section-device">
      <div class="phone">
        <div class="notch-container">
          <div class="clock">{{ dateTime.hours }}:{{ dateTime.minutes }}</div>
          <div class="notch"></div>
          <div class="indicators">
            <CellularIcon class="cellular" size="16"></CellularIcon>
            <WifiIcon class="wifi" size="16"></WifiIcon>
            <div class="battery"></div>
          </div>
        </div>
        <div class="phone-screen">
          <button class="app-icon" v-for="_ in Array(28).fill(0)"></button>
          <div class="popup-bg" :style="payment && { background: 'rgba(0, 0, 0, 0.9)' }" v-if="payment">
            <div id="popup">
              <h3>Confirm Transaction</h3>
              <p>Do you confirm transaction with the code below?</p>
              <div class="code">{{ code }}</div>
              <div class="details">
                <div style="text-decoration: underline"><strong>Transaction Details</strong></div>
                <div>
                  {{ payment.item.name }} <span class="price">{{ payment.item.price }}</span>$
                </div>
              </div>
              <div class="button-holder two-button">
                <a @click.prevent="confirm">Confirm</a>
                <a class="error" @click.prevent="cancel">Cancel</a>
                <div style="clear: both"></div>
              </div>
            </div>
          </div>
        </div>

        <span class="speaker" title="Speaker"></span>
        <span class="camera" title="Camera"></span>

        <button class="silence" title="Silence Switch"></button>
        <button class="volume-up" title="Volume Up"></button>
        <button class="volume-down" title="Volume Down"></button>
        <button class="sleep" title="Sleep"></button>
        <div class="phone-frame"></div>
      </div>
    </section>
  </div>
</template>

<script>
import {SOCKET, cfetch} from "../utils";
import CellularIcon from "../icons/CellularIcon.vue";
import WifiIcon from "../icons/WifiIcon.vue";
import {issuer_metadata} from "../state.js";

const date = new Date();
export default {
  name: 'EndUser',
  components: {CellularIcon, WifiIcon},
  data() {
    return {
      socket: null,
      code: null,
      authRequest: null,
      payment: null,
      dateTime: {
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
      },
      timer: undefined,
    }
  },
  beforeMount() {
    SOCKET.addEventListener('message', ev => {
      try {
        const message = JSON.parse(ev.data)
        if (message.action === "payment_approval") {
          this.authRequest = message.body.authRequest
          this.payment = JSON.parse(this.authRequest.params.payment_details)
          this.code = this.authRequest.params.binding_message
        }
      } catch (e) {
      }
    })
    this.timer = setInterval(this.setDateTime, 1000);
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    async confirm() {
      await cfetch('Approve Transaction', issuer_metadata.backchannel_authentication_approve_endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${this.authRequest.token}`
        },
        body: new URLSearchParams({
          auth_req_id: this.authRequest.jti || this.authRequest.id,
        })
      })
      this.payment = null
    },
    async cancel() {
      await cfetch('Cancel Transaction', issuer_metadata.backchannel_authentication_reject_endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${this.authRequest.token}`
        },
        body: new URLSearchParams({
          auth_req_id: this.authRequest.jti || this.authRequest.id,
          error: 'user_cancelled',
          error_description: 'User cancelled transaction'
        })
      })
      this.payment = null
    },
    setDateTime() {
      const date = new Date();
      this.dateTime = {
        hours: ('0' + date.getHours()).slice(-2),
        minutes: ('0' + date.getMinutes()).slice(-2),
        seconds: ('0' + date.getSeconds()).slice(-2),
      };
    },
  },
}
</script>

<style>
.end-user-app {
  --frame-color: #212121;
  --frame-radius: 5vh;

  header {
    background: #37608f;
  }

  .container {
    height: 65vh;
    margin: 5vh auto;
    width: auto;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  button {
    border: none;
    padding: 0;
    outline: none;
    background-color: transparent;
    user-select: none;
  }

  .phone {
    background: linear-gradient(to top, #5f8bd3 8vh, #3f74ca 7.5vh);
    padding: max(3.5vh, 32px) .5vh 0;
    border-radius: var(--frame-radius);
    position: relative;
    user-select: none;

    &-frame {
      box-shadow: inset 0 0 0 12px var(--frame-color);
      border-radius: var(--frame-radius);
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      pointer-events: none;
    }

    .notch-container {
      position: absolute;
      top: 5px;
      left: 0;
      right: 0;
      padding: 0 3.2vh;
      color: white;
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      align-items: flex-end;

      .notch {
        width: 60%;
        height: 2.7vh;
        margin: 0 auto;
        background-color: var(--frame-color);
        border-bottom-left-radius: 1.8vh;
        border-bottom-right-radius: 1.8vh;
      }

      .clock, .indicators {
        width: 20%;
      }

      .clock {
        z-index: 2;
        font-size: 12px;
        font-weight: 600;
        font-family: Arial, sans-serif;
      }

      .indicators {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
      }
    }

    &-screen {
      display: flex;
      position: relative;
      flex-wrap: wrap;
      margin: 0 .7vh;
      width: 28vh;
      padding-bottom: 10px;
    }
  }


  .cellular, .wifi {
    width: 1.4vh;
  }

  .wifi {
    margin: 0 4px;
  }

  .battery {
    border: 4px solid currentColor;
    width: 12px;
    border-radius: 2px;
  }

  .app-icon {
    width: 4vh;
    height: 4vh;
    border-radius: 1.5vh;
    background-color: #f7f8fa;
    margin: 1.5vh;

    &:active {
      opacity: 0.75;
    }

    &:nth-last-of-type(-n+4) {
      margin-top: 2vh;
    }
  }


  .camera, .speaker, .silence, .volume-up, .volume-down, .sleep {
    position: absolute;
  }

  .speaker, .silence, .volume-up, .volume-down, .sleep {
    background-color: #525c6b;
  }

  .speaker {
    top: 1.8vh;
    height: 0.4vh;
    border-radius: 0.5vh;
    transform: translate(-50%, -50%);
    left: 50%;
    width: 4vh;
  }

  .camera {
    width: 1vh;
    height: 1vh;
    top: 1.3vh;
    left: 60%;
    border-radius: 50%;
    border: 0.3vh solid #525c6b;
  }

  .silence, .volume-up, .volume-down, .sleep {
    width: 0.3vh;
  }

  .volume-up, .volume-down, .sleep {
    height: 5vh;
  }

  .silence, .volume-up, .volume-down {
    left: -0.3vh;
  }

  .sleep {
    right: -0.3vh;
  }

  .silence {
    height: 3vh;
    top: 9vh;
  }

  .volume-up, .sleep {
    top: 15vh;
  }

  .volume-down {
    top: 21vh;
  }


  .popup-bg {
    position: absolute;
    border-radius: 0 0 var(--frame-radius) var(--frame-radius);
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
  }

  #popup {
    width: 84%;
    z-index: 10;
    background: #F9F9F9;
    border-radius: 8px;
    margin: 0 auto;
    text-align: center;
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    h3 {
      margin: 20px 0 0 0;
      padding: 0;
    }

    p {
      margin: 15px 0 0;
      padding: 0 4px;
    }

    a {
      cursor: pointer;
      width: 50%;
      float: left;
      box-sizing: border-box;

      &:first-child {
        border-right: 1px solid #BABABA
      }

      &:active {
        box-shadow: inset 0px 0px 4px 0px #000000ad;
      }
    }

    .code {
      border: 1px solid;
      display: inline-flex;
      padding: 4px;
      font-size: 18px;
      letter-spacing: 4px;
      margin: 12px 0;
    }
  }

  a {
    color: #007AFF;
    text-decoration: none;
    line-height: 45px;
    font-weight: bold;
    display: block;
    border-top: 1px solid #BABABA;
  }

  .error {
    color: #FD3837;
  }

  .details {
    margin-bottom: 8px;
  }

  .price {
    font-weight: bolder;
  }
}

</style>
