const redis = require('redis');
const util = require('util');

const config = require('../config');
const client = redis.createClient(`redis://${config.redisHost}`);

const watch = util.promisify(client.watch).bind(client);
const unwatch = util.promisify(client.unwatch).bind(client);
const get = util.promisify(client.get).bind(client);

function setMaster(key, value, slidingExpirationSeconds) {
    return new Promise((resolve, reject) => {
        client.multi()
            .set(key, value)
            .expire(key, slidingExpirationSeconds)
            // all keys are unwatched when exec is called
            .exec((error, result) => {
                if (error) {
                    console.log("Could not execute transaction! failed on EXEC", error);
                    reject(error);
                } else {
                    if (result === null) {
                        // Execution of MULTI command was not performed due to watched value being changed by other node
                        console.log("O_o >>> \ | / - someone else got the master role");
                        resolve(false);
                    } else {
                        resolve(true);
                    }    
                }
            });
    });
}

async function seizeMasterRole(slidingExpirationSeconds) {
    const master_node_key = "master_node";
    await watch(master_node_key);
    const masterNodeId = await get(master_node_key);
    let isMaster = false;
    if (masterNodeId === null || masterNodeId == config.nodeId) {
        // all keys are unwatched if multi object executes successfully within the setMaster() method
        isMaster = await setMaster(master_node_key, config.nodeId, slidingExpirationSeconds);
    } else {
        await unwatch();
    }
    return isMaster;
}

module.exports = {
    seizeMasterRole,
}