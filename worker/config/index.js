module.exports = {
    // assign a random ID for the worker node once it starts
    nodeId: "worker_node_##########".replace(/#/g, _ => (Math.random()*16|0).toString(16)),
    redisHost: process.env.REDIS_HOST || "localhost",
    // delay between each cycle of worker's infinite loop
    iterationDelay: parseInt(process.env.ITERATION_DELAY) || 1, // in seconds
    // sliding expiration of master node record
    masterExpiration: parseInt(process.env.MASTER_EXPIRATION) || 2, // in seconds
}