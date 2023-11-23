import React from 'react';
import DisplayLog from './DisplayLog';
import TopRightContent from './TopRightContent';
import ModalProvider from './ModalProvider';

export const App = () => (
    <ModalProvider>
        <DisplayLog />
        <TopRightContent />
    </ModalProvider>
);