import {reactive} from "vue";

export const LogMessages = reactive([])

export const Logger = {
    log(type, action, context){
        LogMessages.push({action, type, context, time: new Date().toLocaleTimeString()})
    },
    error(action, context){
        Logger.log('error', action, context)
    },
    debug(action, context){
        Logger.log('debug', action, context)
    },
    warn(action, context){
        Logger.log('warn', action, context)
    },
    info(action, context){
        Logger.log('info', action, context)
    }
}
