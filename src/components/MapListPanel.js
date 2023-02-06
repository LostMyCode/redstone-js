import React from "react";
import RedStone from "../../game/RedStone";

class MapListPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
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

    render() {
        const mapList = window.mapList;

        if (!mapList) return null;

        return (
            <div className="map-list-panel" style={{ height: window.innerHeight * 0.8, overflowY: "scroll" }}>
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
        )
    }
}

export default MapListPanel;