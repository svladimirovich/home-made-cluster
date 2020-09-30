const config = require('./config');
const redisAgent = require('./redis-agent');

const delay = miliseconds => new Promise(resolve => setTimeout(resolve, miliseconds));

async function main() {
    while (true) {
        try {
            await redisAgent.connect(config.redisHost);
            const isMaster = await redisAgent.seizeMasterRole(config.masterExpiration); // sliding expiration of master node record
            if (isMaster) {
                // generate new task
                const task = "Random task ##########".replace(/#/g, _ => (Math.random()*16|0).toString(16));
                console.log(`MASTER ${config.nodeId} generating item: ${task}`);
                await redisAgent.enqueue(task);
                await delay(config.iterationInterval * 1000);
            } else {
                // pick a task to process
                const value = await redisAgent.dequeue();
                if (value)
                    console.log(`SLAVE ${config.nodeId} processing item: ${value}`);
            }
        } catch(error) {
            console.log("Error occured", error, `will retry in ${config.retryInterval} seconds...`);
            redisAgent.dispose();
            await delay(config.retryInterval * 1000);
        }
    }
}

main();