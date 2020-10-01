const redis = require('redis');
const util = require('util');

const config = require('../config');

const TASK_LIST = "tasklist";
const MASTER_NODE_KEY = "master_node";

let wrapper = null;

async function connect(redisHost) {
    if (wrapper == null)
        return new Promise((resolve, reject) => {
            const client = redis.createClient(`redis://${redisHost}`);
            // Redis client subscribed to one or more channels should not issue commands
            const subscriber = redis.createClient(`redis://${redisHost}`);
            client.on('connect', _ => {
                wrapper = {
                    client,
                    subscriber,
                    watch: util.promisify(client.watch).bind(client),
                    unwatch: util.promisify(client.unwatch).bind(client),
                    get: util.promisify(client.get).bind(client),
                    rpush: util.promisify(client.rpush).bind(client),
                    blpop: util.promisify(client.blpop).bind(client),
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
            subscriber.on('message', (channel, message) => {
                if (channel == 'shutdown_request' && message == config.nodeId) {
                    subscriber.unsubscribe('shutdown_request');
                    subscriber.quit();
                    client.quit();
                    process.exit();
                }
            });
            subscriber.subscribe('shutdown_request');
        });
    else
        return wrapper;
}

function setMaster(key, value, slidingExpirationSeconds) {
    return new Promise((resolve, reject) => {
        wrapper.client.multi()
            .set(key, value)
            .expire(key, slidingExpirationSeconds)
            // all keys are unwatched when exec is called
            .exec((error, result) => {
                if (error) {
                    reject(error);
                } else {
                    if (result === null) {
                        // Execution of MULTI command was not performed due to watched value being changed by other node
                        // console.log("O_o - some other node got the master role!");
                        resolve(false);
                    } else {
                        resolve(true);
                    }    
                }
            });
    });
}

async function seizeMasterRole(slidingExpirationSeconds) {
    if (wrapper === null) return Promise.reject("Error! Redis Agent is not connected to any instanse of Redis, use connect() method");
    // this is for one case when watch method simply hangs without resolving on broken connection
    // the only way to read the error is client.on('error') event listener
    if (wrapper.error) throw wrapper.error;
    await wrapper.watch(MASTER_NODE_KEY);
    const masterNodeId = await wrapper.get(MASTER_NODE_KEY);
    let isMaster = false;
    if (masterNodeId === null || masterNodeId == config.nodeId) {
        // all keys are unwatched if multi object executes successfully within the setMaster() method
        isMaster = await setMaster(MASTER_NODE_KEY, config.nodeId, slidingExpirationSeconds);
    } else {
        await wrapper.unwatch();
    }
    return isMaster;
}

async function enqueue(value) {
    if (wrapper === null) return Promise.reject("Error! Redis Agent is not connected to any instanse of Redis, use connect() method");
    await wrapper.rpush(TASK_LIST, value);
}

async function dequeue() {
    if (wrapper === null) return Promise.reject("Error! Redis Agent is not connected to any instanse of Redis, use connect() method");
    const result = await wrapper.blpop(TASK_LIST, config.iterationInterval);
    if (result === null) {
        return null;
    } else {
        return result[1];
    }
}

async function registerNode(nodeId, role) {
    return new Promise((resolve, reject) => {
        wrapper.client.multi()
            .set(nodeId, `${role},nodejs`)
            .expire(nodeId, config.masterExpiration)
            .exec((error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);    
            });
    });
}

function dispose() {
    if (wrapper !== null) {
        try {
            wrapper.client && wrapper.client.quit();
        } catch(error) {}
        wrapper = null;
    }
}

module.exports = {
    connect,
    seizeMasterRole,
    enqueue,
    dequeue,
    dispose,
    registerNode,
}