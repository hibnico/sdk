import React, { useState } from 'react';
import {
  Button, EmptyState, LabelValue, Tooltip,
} from 'saagie-ui/react';
import { Status } from 'saagie-ui/react/projects';
import PropTypes from 'prop-types';
import { useYAMLConfigContext } from '../contexts/YAMLConfigContext';
import { useFormContext } from '../contexts/FormContext';
import { Logs } from './Logs/index';
import { useScriptCall } from '../contexts/ScriptCallHistoryContext';

const propTypes = {
  ready: PropTypes.bool.isRequired,
};

const defaultProps = {};

const JobStatus = {
  AWAITING: 'AWAITING',
  REQUESTED: 'REQUESTED',
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  SUCCEEDED: 'SUCCEEDED',
  KILLING: 'KILLING',
  KILLED: 'KILLED',
  FAILED: 'FAILED',
};

export const Actions = ({ ready }) => {
  const [jobMetadata, setJobMetadata] = useState();
  const [jobStatus, setJobStatus] = useState();
  const [logs, setLogs] = useState();

  const { selectedContext } = useYAMLConfigContext();
  const { formValues } = useFormContext();

  const { actions } = selectedContext || {};

  const {
    start,
    stop,
    getStatus,
    getLogs,
  } = actions || {};

  const [getJobStatus, { status: getJobStatusStatus }] = useScriptCall(getStatus, {
    connectionValues: formValues.connectionValues,
    parameters: formValues.parameters,
    jobMetadata,
  }, (data) => setJobStatus(data));

  const [runJob, { status: runJobStatus }] = useScriptCall(start, {
    connectionValues: formValues.connectionValues,
    parameters: formValues.parameters,
  }, (data) => setJobMetadata(data));

  const [stopJob, { status: stopJobStatus }] = useScriptCall(stop, {
    connectionValues: formValues.connectionValues,
    parameters: formValues.parameters,
    jobMetadata,
  });

  const [getJobLogs, { status: getJobLogsStatus }] = useScriptCall(getLogs, {
    connectionValues: formValues.connectionValues,
    parameters: formValues.parameters,
    jobMetadata,
  }, (res) => setLogs(res.logs));

  const reset = () => {
    setJobMetadata(null);
    setJobStatus(null);
    setLogs(null);
  };

  return (
    <>
      <h3>
        <div className="sui-g-grid as--no-wrap">
          <span className="sui-g-grid__item">
            Instance Actions
          </span>
          <Button className="sui-g-grid__item as--push as--middle" onClick={() => reset()}>Reset</Button>
        </div>
      </h3>
      <div className="sui-g-grid as--start as--middle as--auto">
        <div className="sui-g-grid__item">
          <Button
            color="action-play"
            onClick={() => runJob()}
            isLoading={runJobStatus === 'loading'}
            isDisabled={!ready || !!jobMetadata}
          >
            Start
          </Button>
        </div>
        {stop && (
          <div className="sui-g-grid__item">
            <Button
              color="action-stop"
              onClick={() => stopJob()}
              isLoading={stopJobStatus === 'loading'}
              isDisabled={!ready || !jobMetadata}
            >
              Stop
            </Button>
          </div>
        )}
        {getStatus && (
          <div className="sui-g-grid__item">
            <Button
              onClick={() => getJobStatus()}
              isLoading={getJobStatusStatus === 'loading'}
              isDisabled={!ready || !jobMetadata}
            >
              Get Status
            </Button>
          </div>
        )}
        {getLogs && (
          <div className="sui-g-grid__item">
            <Button
              onClick={() => getJobLogs()}
              isLoading={getJobLogsStatus === 'loading'}
              isDisabled={!ready || !jobMetadata}
            >
              Get Logs
            </Button>
          </div>
        )}
        {jobStatus?.data && (
          <div className="sui-g-grid__item">
            {
              Object.values(JobStatus).find(
                (value) => value.toLowerCase() === jobStatus?.data?.toLowerCase())
                ? <Status name={jobStatus?.data?.toLowerCase() ?? ''} size="xl" />
                : (
                  <Status name="" size="xl">
                    {jobStatus?.data?.toUpperCase()}
                    <Tooltip
                      defaultPlacement="left"
                      label={(
                        <div>
                          Not supported, go to <a href="https://go.saagie.com/design-system" target="_blank" rel="noopener noreferrer">Saagie Design System</a> for supported status
                        </div>
                      )}
                      hideDelay
                      hideDelayCustomTimeOut={1}
                    >
                      <i className="sui-a-icon as--fa-info-circle as--end" />
                    </Tooltip>
                  </Status>
                )
            }
          </div>
        )}
      </div>
      <div className="sui-g-grid">
        <div className="sui-g-grid__item">
          <LabelValue label="Instance Payload">
            {jobMetadata
              ? (<pre>{JSON.stringify(jobMetadata, null, 2)}</pre>)
              : (<EmptyState content="No instance payload" />)}
          </LabelValue>
        </div>
      </div>
      <div className="sui-g-grid">
        <div className="sui-g-grid__item">
          <div style={{ height: '60vh' }}>
            <Logs logs={logs} />
          </div>
        </div>
      </div>
    </>
  );
};

Actions.propTypes = propTypes;
Actions.defaultProps = defaultProps;
