import React from "react";
import { IoClose } from "react-icons/io5";

const Modal = (props) => {
    const { title, children } = props;

    return (
        <div style={{ position: "fixed", zIndex: 10, top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(0, 0, 0, 0.7)", color: "#fff", fontSize: 12, padding: 20 }}>
            <div className="flex align-items-center" style={{ justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>{title}</h2>
                <div onClick={props.onClose} className="button-base" style={{ float: "right" }}>
                    <IoClose />
                </div>
            </div>
            {children}
        </div>
    )
}

export default Modal;