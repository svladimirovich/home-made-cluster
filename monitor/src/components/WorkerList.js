import React from 'react';

import WorkerNode from './WorkerNode';

const WorkerList = props => {

    const nodes = props.nodes.map(node => {
        return <WorkerNode node={node} key={node.nodeId} />;
    })

    return (
        <div className="container">
            <div className="ui horizontal relaxed divided list">
                {nodes}
            </div>
        </div>
    );
};

export default WorkerList;
