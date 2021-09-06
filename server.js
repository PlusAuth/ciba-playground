const {createServer: createViteServer, loadEnv} = require('vite')
const {WebSocketServer, WebSocket} = require("ws")
const ngrok = require('ngrok');
const bodyParser = require('co-body')
const wss = new WebSocketServer({port: 8804});
const env = loadEnv(process.env.NODE_ENV || 'development', '.', '')

async function createServer() {
    // Create vite server in middleware mode.
    const vite = await createViteServer('./vite.config.js')
    vite.middlewares.use('/prompt_end_user', async (req, res, next) => {
        const body = await bodyParser.json(req)
        await new Promise(resolve => {
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        action: 'payment_approval',
                        body
                    }));
                }
            });
            resolve()
        })
        res.writeHead(204)
        res.end()
    })
    vite.middlewares.use('/__notify', async (req, res, next) => {
        const body = await bodyParser.json(req)
        console.log(body)
        //TODO: send back to consumer client and initiate token req
        res.writeHead(204)
        res.end()
    })
    vite.middlewares.stack.splice(0, 0, vite.middlewares.stack.pop())
    vite.middlewares.stack.splice(0, 0, vite.middlewares.stack.pop())
    await vite.listen()
}


(async function () {
    if (env.NGROK_AUTH_TOKEN) {
        console.log('Establishing ngrok connection...')
        const url =  await ngrok.connect({
            addr: env.SERVER_PORT,
            region: env.NGROK_REGION,
            subdomain: env.NGROK_SUBDOMAIN,
        })

        const parsedURL = new URL(url)
        process.env.VITE_APP_SERVER_HOST = parsedURL.host
        console.log(parsedURL.host)
        console.log("Public URL is : %s", url)
    }
    createServer()

})().catch((err) => {
    console.error(err)
    process.exit(1)
});

function terminator(sig) {
    if (typeof sig === 'string') {
        executeAsyncJobs(() => {
            process.exit(1);
        });
    }
}

async function executeAsyncJobs(callback) {
    await ngrok.disconnect()
    callback()
}

['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
    'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
].forEach((sig) => {
    process.on(sig, () => {
        try {
            terminator(sig);
        } catch (e) {
            process.exit(1)
        }
    });
});
