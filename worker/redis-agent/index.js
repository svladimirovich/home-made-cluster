const redis = require('redis');
const util = require('util');

const config = require('../config');
const client = redis.createClient(`redis://${config.redisHost}`);

const TASK_LIST = "tasklist";
const MASTER_NODE_KEY = "master_node";

const watch = util.promisify(client.watch).bind(client);
const unwatch = util.promisify(client.unwatch).bind(client);
const get = util.promisify(client.get).bind(client);
const rpush = util.promisify(client.rpush).bind(client);
const blpop = util.promisify(client.blpop).bind(client);

function setMaster(key, value, slidingExpirationSeconds) {
    return new Promise((resolve, reject) => {
        client.multi()
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
    await watch(MASTER_NODE_KEY);
    const masterNodeId = await get(MASTER_NODE_KEY);
    let isMaster = false;
    if (masterNodeId === null || masterNodeId == config.nodeId) {
        // all keys are unwatched if multi object executes successfully within the setMaster() method
        isMaster = await setMaster(MASTER_NODE_KEY, config.nodeId, slidingExpirationSeconds);
    } else {
        await unwatch();
    }
    return isMaster;
}

async function enqueue(value) {
    await rpush(TASK_LIST, value);
}

async function dequeue() {
    const result = await blpop(TASK_LIST, config.iterationDelay);
    if (result === null) {
        return null;
    } else {
        return result[1];
    }
}

module.exports = {
    seizeMasterRole,
    enqueue,
    dequeue,
}