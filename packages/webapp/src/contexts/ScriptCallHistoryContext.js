import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { useMutation } from 'react-query';
import axios from 'axios';
import { useYAMLConfigContext } from './YAMLConfigContext';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {
  children: '',
};

export const ScriptCallHistoryContext = createContext();
export const useScriptCallHistoryContext = () => useContext(ScriptCallHistoryContext);

export const useScriptCall = (scriptCall, params, onSuccess, onError) => {
  const { selectedContext } = useYAMLConfigContext();
  const { addScriptCall } = useScriptCallHistoryContext();

  const {
    __folderPath: contextFolderPath,
  } = selectedContext || {};

  const addScriptCallResponse = (response) => {
    addScriptCall({
      script: `${contextFolderPath}/${scriptCall.script}`,
      function: scriptCall.function,
      params,
      date: new Date(),
      status: response?.status,
      message: response?.message,
      data: response?.data,
      error: response?.error,
    });
  };

  return useMutation(() => axios.post('/api/action', {
    script: `${contextFolderPath}/${scriptCall.script}`,
    function: scriptCall.function,
    params,
  }), {
    onSuccess: (res) => {
      addScriptCallResponse(res);
      if (onSuccess) {
        onSuccess(res);
      }
    },
    onError: (err) => {
      addScriptCallResponse(err?.response?.data);
      if (onError) {
        onError(err);
      }
    },
  });
};

export const ScriptCallHistoryContextProvider = ({ children }) => {
  const [history, setHistory] = useState([]);

  const addScriptCall = (scriptCall) => {
    setHistory((prev) => [...prev, { ...scriptCall, id: uuid() }]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <ScriptCallHistoryContext.Provider
      value={{
        history,
        addScriptCall,
        clearHistory,
      }}
    >
      {children}
    </ScriptCallHistoryContext.Provider>
  );
};

ScriptCallHistoryContextProvider.propTypes = propTypes;
ScriptCallHistoryContextProvider.defaultProps = defaultProps;
