import React from "react";
import { IoClose } from "react-icons/io5";

const Modal = (props) => {
    const { children } = props;

    return (
        <div style={{ position: "fixed", zIndex: 10, top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(0, 0, 0, 0.5)", border: "1px #fff solid", color: "#fff", fontSize: 12, padding: 20 }}>
            <div onClick={props.onClose} className="button-base" style={{ float: "right" }}>
                <IoClose />
            </div>
            {children}
        </div>
    )
}

export default Modal;