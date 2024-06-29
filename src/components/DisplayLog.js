import React from "react";

class DisplayLog extends React.Component {

    static logs = new Map();
    static setLog = (key, value) => {
        this.logs.set(key, value);
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        window.addEventListener("displayLogUpdate", this.handleUpdate);
    }

    componentWillUnmount() {
        window.removeEventListener("displayLogUpdate", this.handleUpdate);
    }

    handleUpdate = () => {
        this.forceUpdate();
    }

    render() {
        const logs = [];
        DisplayLog.logs.forEach((value, key) => {
            if (!value) return;
            logs.push(<div key={key} id={key}>{value}</div>);
        });

        return (
            <div id="log-container">
                {logs}
            </div>
        )
    }
}

DisplayLog.logs.set("map-name", null);
DisplayLog.logs.set("player-pos", null);
DisplayLog.logs.set("loading-status", null);

window.addEventListener("displayLogUpdate", e => {
    DisplayLog.logs.set(e.detail.key, e.detail.value);
});

export default DisplayLog;