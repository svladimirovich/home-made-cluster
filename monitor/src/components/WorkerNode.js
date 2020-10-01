import React from 'react';

import { terminateNode } from '../api';

const WorkerNode = (props) => {

    const node = props.node;
    const platformImage = `/platforms/${node.platform}.svg`;
    const terminateTitle = `Terminate ${node.nodeId}`;
    const clickHandler = async event => terminateNode(node.nodeId);

    return (
        <div className={`item ${ node.role === "Master" && "master"}`}>
            <img className="ui avatar image" src={platformImage} alt={node.platform + " platform"}></img>
            <div className="right floated content">
                <button className="mini ui circular icon button" onClick={clickHandler} title={terminateTitle}><i className="window close icon"></i></button>
            </div>
            <div className="content">
                <div className="header">{node.role}</div>
                {node.nodeId}
            </div>            
        </div>
    );
};

export default WorkerNode;
