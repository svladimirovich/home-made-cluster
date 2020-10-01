import React from 'react';

import { getNodes } from '../api';
import WorkerList from './WorkerList';

class App extends React.Component {

    state = {
        nodes: [],
        error: null,
    };

    interval = null;

    async refreshNodes() {
        let nodes = [];
        let error = null;
        try {
            nodes = await getNodes();
        } catch (exception) {
            error = exception.toString();
        } finally {
            this.setState({
                nodes,
                error,
            });
        }
    }

    async componentDidMount() {
        await this.refreshNodes();
        this.interval = setInterval(async _ => await this.refreshNodes(), 500);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="ui negative icon message">
                    <i className="exclamation circle icon"></i>
                    <div className="content">
                        <div className="header">
                            Error retrieving worker node information
                        </div>
                        <p>{this.state.error}</p>
                    </div>
                </div>
            );
        }
        return (
            <div>
                <WorkerList nodes={this.state.nodes} />
            </div>
        );
    }
}

export default App;
