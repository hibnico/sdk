import React, { useState } from 'react';
import {
  Button,
  LabelValue,
  Modal,
  ModalHeader,
  ModalCloseButton,
  ModalTitle,
  ModalBody,
  useDisclosure,
  Tooltip,
} from 'saagie-ui/react';
import { useScriptCallHistoryContext } from '../contexts/ScriptCallHistoryContext';

export const SidePanel = () => {
  const [selectedScriptCall, setSelectedScriptCall] = useState();

  const { isOpen, open, close } = useDisclosure();
  const {
    isOpen: isModalOpen,
    open: openModal,
    close: closeModal,
  } = useDisclosure();

  const {
    history,
    clearHistory,
  } = useScriptCallHistoryContext();

  const handleOpenModal = (scriptCall) => {
    setSelectedScriptCall(scriptCall);

    openModal();
  };

  const getScriptCallSummary = (scriptCall) => {
    let message;
    if (scriptCall?.error) {
      message = `${scriptCall?.status} - ${scriptCall?.message}`;
    } else {
      message = `${scriptCall?.status}`;
    }
    return `${scriptCall?.function} - ${message}`;
  };

  const sidePanelLabel = 'Script Call History';

  return (
    <>
      <Tooltip defaultPlacement="right" label={sidePanelLabel}>
        <button
          className="sdk-o-side-panel__trigger"
          type="button"
          onClick={open}
        >
          <span role="img" aria-label="Bug emoji" className="sdk-o-side-panel__trigger-label">
            🐛
          </span>
        </button>
      </Tooltip>
      <div className={`sui-o-side-panel ${isOpen ? 'as--open' : ''} as--left`}>
        <div className="sui-o-side-panel__header">
          <button
            type="button"
            className="sui-o-side-panel__close"
            tabIndex="-1"
            onClick={close}
          >
            &times;
          </button>
          <div className="sui-o-side-panel__title">{sidePanelLabel}</div>
        </div>
        <div className="sui-o-side-panel__body">
          <div className="sui-o-side-panel__scroll">
            {history.length === 0 && (
              <div className="sui-m-message">
                Any action or error will be shown in this panel. Try to click on
                the <code>Run</code> button to try.
              </div>
            )}
            <div>
              {history.map((scriptCall) => (
                <div
                  className="sui-h-mb-md"
                  key={scriptCall.id}
                >
                  <Tooltip label={scriptCall?.on?.date?.toISOString()} defaultPlacement="right">
                    <div
                      role="button"
                      tabIndex="0"
                      className={`sdk-m-card ${scriptCall.error ? 'as--error' : 'as--success'}`}
                      onClick={() => handleOpenModal(scriptCall)}
                      onKeyDown={(event) => {
                        if (event.keyCode !== 13) {
                          return;
                        }

                        handleOpenModal(scriptCall);
                      }}
                    >
                      {getScriptCallSummary(scriptCall)}
                    </div>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="sui-o-side-panel__footer">
          <div className="sui-g-grid">
            <div className="sui-g-grid__item as--pull">
              <Button onClick={clearHistory}>Clear History</Button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} size="xxl">
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle>{getScriptCallSummary(selectedScriptCall)}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <LabelValue label="Script">
            <pre>{selectedScriptCall?.script}</pre>
          </LabelValue>
          <LabelValue label="Function">
            <pre>{selectedScriptCall?.function}</pre>
          </LabelValue>
          <LabelValue label="Params">
            <pre>{JSON.stringify(selectedScriptCall?.params, null, 2)}</pre>
          </LabelValue>
          <LabelValue label="Response - Status">
            <pre>{selectedScriptCall?.status}</pre>
          </LabelValue>
          {selectedScriptCall?.message
            && (
              <LabelValue label="Response - Message">
                <pre>{selectedScriptCall?.message}</pre>
              </LabelValue>
            )}
          {selectedScriptCall?.data
            && (
              <LabelValue label="Response - Data">
                <pre>{JSON.stringify(selectedScriptCall?.data, null, 2)}</pre>
              </LabelValue>
            )}
          {selectedScriptCall?.error
            && (
              <LabelValue label="Response - Error">
                <pre>{selectedScriptCall?.error}</pre>
              </LabelValue>
            )}
        </ModalBody>
      </Modal>
    </>
  );
};
