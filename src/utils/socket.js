const socketProtocol = (location.protocol === 'https:' ? 'wss' : 'ws')
const socketHost = `${location.hostname}:${8804}`
export const SOCKET = new WebSocket(`${socketProtocol}://${socketHost}`, 'vite-hmr')
