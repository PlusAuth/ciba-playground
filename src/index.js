import {createApp, h} from "vue";
import ConfigurationPanel from "./components/ConfigurationPanel.vue";
import Consumer from "./components/Consumer.vue";
import DebugPanel from "./components/DebugPanel.vue";
import EndUser from "./components/EndUser.vue";
import ErrorAlert, {$showAlert} from "./components/Alert.vue";

const app = createApp({
    render() {
        return [
            h('div', {class: 'apps-container'},
                [
                    h(Consumer), h(EndUser)
                ]),
            h('div',{ class: 'panels'}, [
                h(ConfigurationPanel),
                h(DebugPanel),
            ]),
            h(ErrorAlert)
        ]
    }
})

app.config.errorHandler = (err) => {
    $showAlert(err.error || err.message || err.name, err.error_description, {
        timeout: null
    })
}

app.mount('#app')
