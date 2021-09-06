<template>
  <div class="app consumer-app">
    <header class="app-header">CONSUMER DEVICE</header>
    <section class="app-section-info">
      <p>At this state, we assume consumer device/application knows End-User's unique identifier (user id, phone
        number,
        email etc.)</p>
    </section>
    <section class="app-section-device">
      <div class="device">
        <div class="monitor">
          <div class="monitor-screen">
            <div class="shopping-items">
              <div class="shopping-item" v-for="item in items">
                <div class="shopping-item-image">
                  <ImagePlaceholder size="128" color="gray"></ImagePlaceholder>
                </div>
                <div class="shopping-item-name"> {{ item.name }}</div>
                <div class="shopping-item-price"> {{ item.price }}$</div>
                <button class="button" @click="buy(item)">BUY</button>
              </div>
            </div>
          </div>
          <div class="confirmation-overlay" v-if="overlay">
            <div class="timer">{{ secondsTimerID }}</div>
            <p>Please confirm transaction in your device with the code below:</p>

            <div class="code">{{ code }}</div>

            <button class="button" @click="cancel"> CANCEL</button>
          </div>
        </div>
        <div class="monitor-stand"></div>
        <div class="monitor-rig">
          <div class="fan"></div>
          <div class="open"></div>
        </div>
      </div>

    </section>
  </div>

</template>

<script>
import {cfetch, generateSignedJWT, generateRandom, generateTimer} from "../utils";
import ImagePlaceholder from "../icons/ImagePlaceholder.vue";
import {CONFIG, issuer_metadata} from "../state.js";
import {Logger} from "../utils/logger.js";
import {$showAlert} from "./Alert.vue";

export default {
  name: 'Consumer',
  components: {ImagePlaceholder},
  data() {
    return {
      code: null,
      overlay: false,
      tokenResult: null,
      pollingTimerID: null,
      secondsTimerID: null,
      items: [
        {name: 'Blue Hat', price: '10'},
        {name: 'Red Dress', price: '50'},
        {name: 'Yellow Dress', price: '50'},
        {name: 'Green Dress', price: '40'},
        {name: 'Black Watch', price: '50'},
        {name: 'Yellow Watch', price: '60'},
      ],
    }
  },
  beforeUnmount() {
    if (this.pollingTimerID) {
      clearInterval(this.pollingTimerID)
    }
  },
  methods: {
    cancel() {
      this.overlay = false
      if (this.pollingTimerID) {
        clearInterval(this.pollingTimerID)
      }
      if (this.secondsTimerID) {
        clearInterval(this.secondsTimerID)
      }
    },
    pollRequest(auth_req_id, interval) {
      this.pollingTimerID = setTimeout(async () => {
        const body = {
          grant_type: "urn:openid:params:grant-type:ciba",
          client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
          client_assertion: await generateSignedJWT({
            alg: 'HS256',
            subject: CONFIG.client_id,
            issuer: CONFIG.client_id,
            audience: CONFIG.issuer,
            signature: new TextEncoder().encode(CONFIG.client_secret)
          }),
          auth_req_id
        }
        try {
          this.tokenResult = await cfetch(`Polling CIBA Request`, issuer_metadata.token_endpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams(body)
          });
          $showAlert('Transaction Completed', null, { color: 'success'});
          return this.transactionCleanup()
        } catch (e) {
          switch (e.error){
            case 'authorization_pending':
              return this.pollRequest(auth_req_id, interval)
            default:
              $showAlert(e.error, e.error_description);
          }
          this.transactionCleanup()
        }

      }, interval || 5000)

    },
    transactionCleanup() {
      this.overlay = false
      if (this.pollingTimerID) {
        clearTimeout(this.pollingTimerID)
      }
      if (this.secondsTimerID) {
        clearInterval(this.secondsTimerID)
      }
    },
    /**
     * In real world applications this should be handled in backend as we are exposing client secret/s here.
     */
    async buy(item) {
      this.tokenResult = null;
      this.code = generateRandom(8)
      const authResponse = await cfetch('Initiating CIBA Flow',issuer_metadata.backchannel_authentication_endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
          grant_type: "urn:openid:params:grant-type:ciba",
          client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
          client_assertion: await generateSignedJWT({
            alg: 'HS256',
            subject: CONFIG.client_id,
            issuer: CONFIG.client_id,
            audience: CONFIG.issuer,
            signature: new TextEncoder().encode(CONFIG.client_secret)
          }),
          client_notification_token: "token",
          scope: "openid profile read:user write:user",
          audience: 'https://test.buysomething.com',
          login_hint: CONFIG.user_id,
          binding_message: this.code,
          request_context: {
            location: {}
          },
          payment_details: JSON.stringify({
            item,
            amount: 1
          })
        })
      })
      Logger.debug('CIBA Request Response', authResponse)
      this.pollRequest(authResponse.auth_req_id, 5000)
      this.secondsTimerID = generateTimer(authResponse.expires_in || 600)
      this.overlay = true
    }
  },
}
</script>

<style>
.consumer-app {
  --main-color: #272727;

  header {
    background: #8f3737;
  }

  .device {
    width: 90%;
    height: 100%;
    display: flex;
    flex-wrap: nowrap;
    flex-direction: column;
    justify-content: center;

    .monitor {
      width: 90%;
      position: relative;
      margin: 0 auto;
    //max-width: 800px; border-radius: 18px; background-color: var(--main-color); border: 32px solid var(--main-color);

      &-screen {
        height: 45vh;
        min-height: 250px;
        padding: 8px;
        position: relative;
        overflow-y: scroll;
        border-radius: .5em;
        background: white;

        &::-webkit-scrollbar {
          width: 15px;
        }

        &::-webkit-scrollbar-thumb {
          background: #666;
        }

        &::-webkit-scrollbar-track {
          background-color: #888;
        }
      }

      &-stand {
        width: 30%;
        max-width: 400px;
        min-height: 40px;
        background: #484d54;
        height: 10%;
        margin: 0 auto;

        &:after {
          content: " ";
          width: 15%;
          float: right;
          background: #3b3f44;
          height: 100%;
        }
      }

      &-rig {
        border-radius: 12px;
        height: 140px;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: center;
        background: var(--main-color);
        width: 100%;
        margin: 0 auto;
        position: relative;

        &:before {
          content: "";
          border-radius: inherit;
          width: 90%;
          height: 100%;
          left: 0;
          position: absolute;
          background: var(--main-color);
        }

        .fan {
          height: 2vh;
          border-radius: 25px;
          width: 45%;
          z-index: 1;
          background: #5D656E;
        }

        .open {
          border-radius: 50%;
          background: white;
          z-index: 1;
          width: 5vh;
          height: 5vh;
          margin-left: 5vh;
        }
      }
    }
  }


  .shopping-items {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-around;

    .shopping-item {
      padding: 8px;
      width: 200px;
      text-align: center;

      &-image {
        padding: 4px 16px;

        img {
          width: 100%;
        }
      }

      &-price {
        font-weight: bold;
      }

      &-name {

      }
    }
  }


  .button {
    margin-top: 4px;
    font-weight: bold;
    cursor: pointer;
    background: white;
    border: 1px solid #7a7a7a;
    border-radius: 4px;
    padding: 4px 12px;

    &:active {
      background: #dedede;
      transform: scale(0.95);
    }
  }

  .confirmation-overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.92);
    text-align: center;
    color: white;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    font-size: 18px;

    .code {
      border: 1px solid;
      display: inline-flex;
      padding: 12px;
      font-size: 32px;
      letter-spacing: 4px;
      margin-top: 12px;
    }

    .timer {
      width: 72px;
      line-height: 72px;
      border-radius: 50%;
      text-align: center;
      font-size: 32px;
      border: 2px solid orange;
    }
  }

}

</style>
