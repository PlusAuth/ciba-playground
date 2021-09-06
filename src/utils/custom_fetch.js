import {Logger} from "./logger.js";

/**
 *
 * @param action { string }
 * @param url { RequestInfo }
 * @param options { RequestInit? }
 * @returns {Promise<string>}
 */
export async function cfetch(action, url, options) {
    const response = await fetch(url, options)
    const contentType = response.headers.get("content-type");
    let responseBody
    if (contentType && contentType.indexOf("application/json") !== -1) {
        responseBody = await response.json()
    } else {
        responseBody = await response.text()
    }
    Logger.debug(action, {
        request: {
            url,
            method: 'GET',
            ...options || {},
            ...options?.body && options.body instanceof URLSearchParams ?
                { body: Object.fromEntries(options.body) } : { body: options?.body || {} }
        },
        response: responseBody
    })

    if (response.ok) {
        return responseBody
    } else {
        throw responseBody
    }
}
