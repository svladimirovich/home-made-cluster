module.exports = {
    // assign a random ID for the worker node once it starts
    nodeId: "worker_node_##########".replace(/#/g, _ => (Math.random()*16|0).toString(16)),
    redisHost: process.env.REDIS_HOST || "localhost",

    // in the following settings, values less than 1 are unacceptable
    // delay between each cycle of worker's infinite loop
    iterationInterval: parseInt(process.env.ITERATION_INTERVAL) || 1, // in seconds
    retryInterval: parseInt(process.env.RETRY_INTERVAL) || 3, // in seconds
    // sliding expiration of master node record, should be longer than iteration interval
    masterExpiration: parseInt(process.env.MASTER_EXPIRATION) || 2, // in seconds

}