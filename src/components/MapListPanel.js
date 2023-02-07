import React from "react";
import RedStone from "../../game/RedStone";

class MapListPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
        };
    }

    componentDidMount() {
        if (!window.mapList) {
            window.addEventListener("mapListLoaded", this.handleMapListLoad);
        }
    }

    componentWillUnmount() {
        window.removeEventListener("mapListLoaded", this.handleMapListLoad);
    }

    handleMapListLoad = () => {
        this.forceUpdate();
    }

    handleItemClick = (e, rmdFileName) => {
        e.stopPropagation();
        RedStone.loadMap(rmdFileName);
    }

    handleExpanderClick = (e) => {
        const { expanded } = this.state;
        this.setState({ expanded: !expanded });
    }

    render() {
        const mapList = window.mapList;
        const { expanded } = this.state;

        if (!mapList) return null;

        return (
            <div className="map-list-container">
                <div className="map-list-expander" onClick={this.handleExpanderClick}>{expanded ? "Close map list" : "Show map list"}</div>
                <div className="map-list-panel" style={{
                    height: expanded ? window.innerHeight * 0.8 : 0,
                    overflowY: "scroll",
                    opacity: expanded ? 1 : 0
                }}>
                    {Object.keys(mapList).map(key => {
                        return (
                            <div
                                key={`map-${mapList[key].fileName}`}
                                className="map-list-item"
                                onClick={(e) => this.handleItemClick(e, mapList[key].fileName)}
                            >
                                {mapList[key].name}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}

export default MapListPanel;