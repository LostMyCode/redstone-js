import React, { useMemo, useState } from "react";
import Modal from "./Modal";

export const ModalContext = React.createContext();

const ModalProvider = ({ children }) => {
    const [modalContent, setModalContent] = useState();
    const value = useMemo(() => ({
        close: () => setModalContent(),
        open: setModalContent
    }), []);

    return (
        <ModalContext.Provider value={value}>
            {modalContent ? <Modal onClose={value.close}>{modalContent}</Modal> : null}
            {children}
        </ModalContext.Provider>
    )
}

export default ModalProvider;