'use strict';

const config = require('../config');

const nodes = [
    {
        nodeId: "worker-node-1",
        role: "Slave",
        platform: "nodejs",
    }, {
        nodeId: "worker-node-2",
        role: "Slave",
        platform: "nodejs",
    }, {
        nodeId: "worker-node-3",
        role: "Slave",
        platform: "nodejs",
    }, {
        nodeId: "worker-node-4",
        role: "Slave",
        platform: "nodejs",
    }, {
        nodeId: "worker-node-5",
        role: "Master",
        platform: "nodejs",
    }, {
        nodeId: "worker-node-6",
        role: "Slave",
        platform: "nodejs",
    }, {
        nodeId: "worker-node-7",
        role: "Slave",
        platform: "nodejs",
    }, {
        nodeId: "worker-node-8",
        role: "Slave",
        platform: "nodejs",
    }
];

module.exports = function(app, server) {

    app.get("/api/nodes", (request, response) => {
        response.json(nodes);
    });

    app.delete("/api/node/:id", (request, response) => {
        const targetId = request.params.id;
        const targetNode = nodes.find(node => node.nodeId == targetId);

        if (targetNode) {
            const index = nodes.indexOf(targetNode);
            nodes.splice(index, 1);
            response.status(202).end();
        } else {
            response.status(403).end();
        }
    });
}