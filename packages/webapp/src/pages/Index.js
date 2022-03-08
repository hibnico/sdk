import React from 'react';
import { useQuery } from 'react-query';
import {
  Page, PageLoader, PageContent, EmptyState, PageFooter, FormFeedback,
} from 'saagie-ui/react';
import axios from 'axios';
import { AppTopbar } from '../components/AppTopbar';
import { SmartForm } from '../components/SmartForm';
import { Actions } from '../components/Actions';
import { useYAMLConfigContext } from '../contexts/YAMLConfigContext';
import { useFormContext } from '../contexts/FormContext';

const propTypes = {};
const defaultProps = {};

const getCurrentConnectionType = (config, selectedContext) =>
  config?.connectionTypes?.filter((c) => c.id === selectedContext?.connectionTypeId)?.[0];

const isConnectionTypeReady = (parameters, formValues) => {
  if (!parameters || !formValues) {
    return false;
  }
  const mandatoryFields = parameters.filter((param) => param.mandatory);
  for (let i = 0; i < mandatoryFields.length; i += 1) {
    const value = formValues[mandatoryFields[i].id];
    if (!value) {
      return false;
    }
  }
  return true;
};

export const Index = () => {
  const { status, selectedContext, config } = useYAMLConfigContext();
  const { formValues } = useFormContext();
  const { infoStatus, data: info } = useQuery('info', () => axios('/api/info'));

  if (status === 'loading') {
    return (
      <Page>
        <PageLoader isLoading />
      </Page>
    );
  }

  if (status === 'error') {
    return (
      <Page size="sm">
        <PageContent>
          <EmptyState icon="fa-warning" content="Something wrong happened" />
        </PageContent>
      </Page>
    );
  }

  const connectionType = getCurrentConnectionType(config, selectedContext);
  const connectionTypeReady = isConnectionTypeReady(connectionType?.parameters, formValues?.connectionValues);
  const jobFormReady = isConnectionTypeReady(selectedContext?.parameters, formValues?.parameters);

  return (
    <Page size="xxl">
      <AppTopbar />
      <PageContent key={selectedContext?.id}>
        <div className="sui-g-grid as--gutter-xxl">
          <div className="sui-g-grid__item as--2_7">
            <h3>Connection Type Form</h3>
            {connectionType
              ? (
                <div>
                  { connectionTypeReady
                    ? <FormFeedback color="success">Form validated</FormFeedback>
                    : <FormFeedback color="danger">The form is missing required information</FormFeedback>}
                  <SmartForm name="connectionValues" parameters={connectionType?.parameters} />
                </div>
              )
              : <span className="sdk-error-message">Error: connection type &apos;{selectedContext?.connectionTypeId}&apos; not found</span>}
          </div>
          <div
            className="sui-g-grid__item as--2_7"
            key={JSON.stringify(formValues.connectionValues)}
          >
            <h3>Job Form</h3>
            <div>
              { jobFormReady
                ? <FormFeedback color="success">Form validated</FormFeedback>
                : <FormFeedback color="danger">The form is missing required information</FormFeedback>}
              <SmartForm name="parameters" parameters={selectedContext?.parameters} dependencyReady={connectionTypeReady} />
            </div>
          </div>
          <div className="sui-g-grid__item as--3_7">
            <h3>Instance Actions</h3>
            <Actions ready={connectionTypeReady && jobFormReady} />
          </div>
        </div>
      </PageContent>
      <PageFooter>
        <small>
          You are running this SDK UI in <code>{process.env.NODE_ENV}</code> using build <code>{process.env.REACT_APP_GIT_SHA}</code> with <code>@saagie/sdk@{infoStatus === 'loading' || infoStatus === 'error' ? '...' : info?.version}</code> CLI
        </small>
      </PageFooter>
    </Page>
  );
};

Index.propTypes = propTypes;
Index.defaultProps = defaultProps;
