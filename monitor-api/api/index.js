'use strict';

const config = require('../config');
const redisAgent = require('../redis-agent');

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
        const targetId = request.params.id;
        redisAgent.requestShutdown(targetId);
        response.status(202).end();
    });
}