const config = require('./config');
const redisAgent = require('./redis-agent');

const delay = miliseconds => new Promise(resolve => setTimeout(resolve, miliseconds));

async function main() {
    while (true) {
        const isMaster = await redisAgent.seizeMasterRole(config.masterExpiration); // sliding expiration of master node record

        if (isMaster) {
            console.log(`${config.nodeId}>`, "I am MASTER node");

            // TODO: tidy up tasks that are left from broken workers

            // TODO: generate new task

        } else {
            console.log(`${config.nodeId}>`, "I am slave node");
            
            // TODO: pick a task to process
            
        }

        await delay(config.iterationDelay * 1000);
    }
}

main();