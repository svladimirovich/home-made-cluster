const redis = require('redis');
const util = require('util');

const WORKER_NODE_PREFIX = "worker_node";

let wrapper = null;

async function connect(redisHost) {
    if (wrapper == null)
        return new Promise((resolve, reject) => {
            const client = redis.createClient(`redis://${redisHost}`);
            client.on('connect', _ => {
                wrapper = {
                    client,
                    keys: util.promisify(client.keys).bind(client),
                    mget: util.promisify(client.mget).bind(client),
                };
                resolve(wrapper);
            });
            client.on('error', error => {
                // store the error for everyone to see (especially at the step when watch() method is required)
                if (wrapper && !wrapper.error) {
                    wrapper.error = error;
                }
                reject(error);
            });
        });
    else
        return wrapper;
}

function dispose() {
    if (wrapper !== null) {
        try {
            wrapper.client && wrapper.client.quit();
        } catch(error) {}
        wrapper = null;
    }
}

async function getCurrentNodes() {
    if (wrapper === null) return Promise.reject("Error! Redis Agent is not connected to any instanse of Redis, use connect() method");
    if (wrapper.error) throw wrapper.error;

    const keys = await wrapper.keys(`${WORKER_NODE_PREFIX}*`);
    const values = await wrapper.mget(...keys);

    const nodes = [];
    for (i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = values[i];
        const splitted = value.split(',');
        const role = splitted[0];
        const platform = splitted[1];

        nodes.push({
            nodeId: key,
            role,
            platform,
        });
    }
    return nodes;
}

function requestShutdown(nodeId) {
    try {
        wrapper && wrapper.client.publish("shutdown_request", nodeId);
    } catch(error) {}
}

module.exports = {
    connect,
    dispose,
    getCurrentNodes,
    requestShutdown,
}