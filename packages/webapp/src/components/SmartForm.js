import React from 'react';
import PropTypes from 'prop-types';
import { SmartField } from './SmartField';
import { useYAMLConfigContext } from '../contexts/YAMLConfigContext';
import { useFormContext } from '../contexts/FormContext';

const propTypes = {
  name: PropTypes.string.isRequired,
  parameters: PropTypes.array.isRequired,
};

const defaultProps = {};

export const SmartForm = ({ name, parameters }) => {
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
        {parameters?.map((parameter) => (
          <SmartField
            key={parameter.id}
            parameter={parameter}
            formName={name}
            formValues={formValues}
            contextFolderPath={selectedContext?.__folderPath}
            onUpdate={updateForm(name)}
          />
        ))}
      </form>
    </>
  );
};

SmartForm.propTypes = propTypes;
SmartForm.defaultProps = defaultProps;
