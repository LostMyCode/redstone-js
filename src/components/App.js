import React from 'react';
import { Toaster } from 'sonner';

import DisplayLog from './DisplayLog';
import TopRightContent from './TopRightContent';
import ModalProvider from './ModalProvider';

export const App = () => (
    <ModalProvider>
        <Toaster richColors position="top-left" expand={false} />
        <DisplayLog />
        <TopRightContent />
    </ModalProvider>
);