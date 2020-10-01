'use strict';

const config = require('../config');
const redisAgent = require('../redis-agent');

const nodes = [];

module.exports = function(app, server) {

    app.get("/api/nodes", async (request, response) => {
        try {
            await redisAgent.connect(config.redisHost);
            const nodes = await redisAgent.getCurrentNodes();
            response.json(nodes);
        } catch(error) {
            console.log("Error while communicating to Redis", error);
            redisAgent.dispose();
            response.status(500).end();
        }
    });

    app.delete("/api/node/:id", (request, response) => {
        // TODO: should send shutdown message to worker
        
        const targetId = request.params.id;
        const targetNode = nodes.find(node => node.nodeId == targetId);

        if (targetNode) {
            const index = nodes.indexOf(targetNode);
            nodes.splice(index, 1);
            response.status(202).end();
        } else {
            response.status(404).end();
        }
    });
}