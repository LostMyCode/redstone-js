import React, { useMemo, useState } from "react";
import Modal from "./Modal";

export const ModalContext = React.createContext();

const ModalProvider = ({ children }) => {
    const [options, setOptions] = useState({});
    const [modalContent, setModalContent] = useState();
    const value = useMemo(() => ({
        close: () => setModalContent(),
        open: (content, options = {}) => {
            setOptions(options);
            setModalContent(content);
        }
    }), []);

    return (
        <ModalContext.Provider value={value}>
            {modalContent ? <Modal onClose={value.close} title={options.title}>{modalContent}</Modal> : null}
            {children}
        </ModalContext.Provider>
    )
}

export default ModalProvider;