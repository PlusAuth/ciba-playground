import {watch, reactive} from "vue";
import {cfetch} from "./utils/custom_fetch.js";
import {ENV} from "./environment.js";

/**
 * Issuer metadata received from /.well-known/openid-configuration
 * @type {Record<string, any>}
 */
export let issuer_metadata = reactive({})
export const CONFIG = reactive({
    issuer: ENV.ISSUER,
    client_id: ENV.CONSUMER_CLIENT_ID,
    client_secret: ENV.CONSUMER_CLIENT_SECRET,
    user_id: ENV.USER_ID,
})

watch(() => CONFIG.issuer, async (value) => {
    const discoveryUri = `${value}${value.endsWith('/') ? '' : '/'}.well-known/openid-configuration`
    Object.assign(issuer_metadata, await cfetch(`Fetching issuer metadata. Issuer: ${value}`, discoveryUri))
},{immediate:true})
