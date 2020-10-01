import axios from 'axios';

export async function getNodes() {
    const result = await axios.get('/api/nodes');
    return result.data;
}

export function terminateNode(nodeId) {
    axios.delete(`/api/node/${encodeURIComponent(nodeId)}`);
}