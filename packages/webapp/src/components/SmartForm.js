import React from 'react';
import PropTypes from 'prop-types';
import { SmartField } from './SmartField';
import { useYAMLConfigContext } from '../contexts/YAMLConfigContext';
import { useFormContext } from '../contexts/FormContext';

const propTypes = {
  name: PropTypes.string.isRequired,
  parameters: PropTypes.array.isRequired,
  dependencyReady: PropTypes.bool,
};

const defaultProps = {
  dependencyReady: true,
};

export const SmartForm = ({ name, parameters, dependencyReady }) => {
  const { selectedContext } = useYAMLConfigContext();
  const { formValues, updateForm } = useFormContext();

  return (
    <>
      {!parameters?.length && (
        <div className="sui-m-message as--light as--warning">
          No features
        </div>
      )}
      <form autoComplete="off">
        {parameters?.map((parameter) => {
          const unreadyParamDependencies = parameter.dependsOn
            ?.map((paramId) => parameters.filter((p) => p.id === paramId)?.[0])
            ?.filter((dep) => !formValues[name]?.[dep.id]);
          const paramDependencyReady = dependencyReady
            && (!unreadyParamDependencies || unreadyParamDependencies.length === 0);
          return (
            <SmartField
              key={parameter.id}
              parameter={parameter}
              formName={name}
              formValues={formValues}
              contextFolderPath={selectedContext?.__folderPath}
              onUpdate={updateForm(name)}
              dependencyReady={paramDependencyReady}
            />
          );
        })}
      </form>
    </>
  );
};

SmartForm.propTypes = propTypes;
SmartForm.defaultProps = defaultProps;
