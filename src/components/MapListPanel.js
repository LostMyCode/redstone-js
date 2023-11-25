import React from "react";
import { IoSettingsSharp } from "react-icons/io5";
import RedStone from "../../game/RedStone";
import SettingsPanel from "./SettingsPanel";
import { ModalContext } from "./ModalProvider";
import SettingsManager from "../../game/SettingsManager";

class MapListPanel extends React.Component {
    static contextType = ModalContext;

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

    componentDidUpdate(prevProps, prevState) {
        const expanded = this.state.expanded;
        if (expanded !== prevState.expanded) {
            RedStone.mapListExpanded = expanded;
            const minimap = document.getElementById("minimap");
            if (SettingsManager.get("showMinimap") && minimap) {
                clearTimeout(this.toggleMinimapTimeout);
                this.toggleMinimapTimeout = setTimeout(() => {
                    minimap.style.display = !expanded ? "block" : "none";
                }, !expanded ? 500 : 0);
            }
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

    handleSettingsClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const { open, close } = this.context;
        open(<SettingsPanel onClose={() => close()} />, { title: "Settings" });
    }

    render() {
        const mapList = window.mapList;
        const { expanded } = this.state;

        if (!mapList) return null;

        return (
            <div className="map-list-container">
                <div className="map-list-expander" onClick={this.handleExpanderClick}>
                    <div>{expanded ? "Close map list" : "Show map list"}</div>
                    <div className="flex" style={{ gap: 5 }}>
                        <a href="https://twitter.com/LostMyCode" target="_blank">Twitter</a>
                        <a href="https://github.com/LostMyCode/redstone-js" target="_blank">GitHub</a>
                        <div className="flex align-items-center button-base" onClick={this.handleSettingsClick}>
                            <IoSettingsSharp />
                        </div>
                    </div>
                </div>
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