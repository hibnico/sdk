import React from 'react';
import { YAMLConfigContextProvider } from './contexts/YAMLConfigContext';
import { Index } from './pages/Index';
import { FormContextProvider } from './contexts/FormContext';
import { SidePanel } from './components/SidePanel';
import './scss/index.scss';
import { ScriptCallHistoryContextProvider } from './contexts/ScriptCallHistoryContext';

function App() {
  return (
    <YAMLConfigContextProvider>
      <FormContextProvider>
        <ScriptCallHistoryContextProvider>
          <SidePanel />
          <Index />
        </ScriptCallHistoryContextProvider>
      </FormContextProvider>
    </YAMLConfigContextProvider>
  );
}

export default App;
