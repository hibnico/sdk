import React from 'react';
import { useQuery } from 'react-query';
import {
  Page, PageLoader, PageContent, EmptyState, PageFooter, FormFeedback, Button, InfoText, Message,
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
  const { formValues, clearForm } = useFormContext();
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
            <h3>
              <div className="sui-g-grid as--no-wrap">
                <span className="sui-g-grid__item">
                  Connection Type Form
                  { connectionTypeReady
                    ? <InfoText color="success">Form validated</InfoText>
                    : <InfoText color="danger">The form is missing required information</InfoText>}
                </span>
                <Button className="sui-g-grid__item as--push as--middle" onClick={() => clearForm('connectionValues')}>Clear</Button>
              </div>
            </h3>
            {connectionType
              ? <SmartForm name="connectionValues" parameters={connectionType?.parameters} />
              : <Message color="danger">Error: connection type &apos;{selectedContext?.connectionTypeId}&apos; not found</Message>}
          </div>
          <div className="sui-g-grid__item as--2_7">
            <h3>
              <div className="sui-g-grid as--no-wrap">
                <span className="sui-g-grid__item">
                  Job Form
                  { jobFormReady
                    ? <FormFeedback color="success">Form validated</FormFeedback>
                    : <FormFeedback color="danger">The form is missing required information</FormFeedback>}
                </span>
                <Button className="sui-g-grid__item as--push as--middle" onClick={() => clearForm('parameters')}>Clear</Button>
              </div>
            </h3>
            <SmartForm name="parameters" parameters={selectedContext?.parameters} dependencyReady={connectionTypeReady} />
          </div>
          <div className="sui-g-grid__item as--3_7">
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
