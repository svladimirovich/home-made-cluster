const config = require('./config');
const redisAgent = require('./redis-agent');

const delay = miliseconds => new Promise(resolve => setTimeout(resolve, miliseconds));

async function main() {
    while (true) {
        const isMaster = await redisAgent.seizeMasterRole(config.masterExpiration); // sliding expiration of master node record
        if (isMaster) {
            // generate new task
            const task = "Random task ##########".replace(/#/g, _ => (Math.random()*16|0).toString(16));
            console.log(`MASTER ${config.nodeId} generating item: ${task}`);
            await redisAgent.enqueue(task);
            await delay(config.iterationDelay * 1000);
        } else {
            // pick a task to process
            const value = await redisAgent.dequeue();
            if (value)
                console.log(`SLAVE ${config.nodeId} processing item: ${value}`);
        }
    }
}

main();