import React, {
  useState, useRef, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  FormCheck,
  FormControlInput,
  FormPassword,
  FormControlSelect,
} from 'saagie-ui/react';
import { useScriptCall } from '../contexts/ScriptCallHistoryContext';

const propTypes = {
  onUpdate: PropTypes.func,
  formName: PropTypes.string.isRequired,
  formValues: PropTypes.object,
  contextFolderPath: PropTypes.string,
  parameter: PropTypes.object,
  dependencyReady: PropTypes.bool,
};

const defaultProps = {
  onUpdate: () => {},
  formValues: {},
  contextFolderPath: '',
  parameter: {},
  dependencyReady: true,
};

export const SmartField = ({
  onUpdate = () => {},
  formValues = {},
  formName,
  contextFolderPath,
  dependencyReady,
  parameter: {
    type,
    id,
    label,
    mandatory,
    comment,
    dynamicValues,
    staticValues,
    dependsOn,
    defaultValue,
  },
}) => {
  const [error, setError] = useState();

  const [getValues] = useScriptCall(dynamicValues, formValues);

  const currentForm = formValues?.[formName] || {};

  const shouldBeDisplayed = !dependsOn || dependsOn?.every((x) => currentForm[x]);
  const dependsOnValues = JSON.stringify(dependsOn?.map((x) => currentForm[x]));

  const currentFormRef = useRef();
  currentFormRef.current = currentForm;

  const fieldValue = currentForm[id];

  useEffect(() => {
    if (!fieldValue && mandatory) {
      setError({ message: 'Required' });
    } else {
      setError(null);
    }
  }, [fieldValue, mandatory]);

  const getField = () => {
    switch (type) {
    case 'TOGGLE': {
      return (
        <FormCheck
          key={id}
          name={id}
          defaultChecked={defaultValue}
          onChange={(e) => onUpdate({ name: id, value: e.target.value })}
        >{label || ''}
        </FormCheck>
      );
    }

    case 'TEXT':
      return (
        <FormControlInput
          name={id}
          value={fieldValue || ''}
          onChange={(e) => onUpdate({ name: id, value: e.target.value })}
          required={mandatory}
        />
      );

    case 'PASSWORD':
      return (
        <FormPassword
          name={id}
          value={fieldValue || ''}
          autoComplete={id}
          onChange={(e) => onUpdate({ name: id, value: e.target.value })}
        />
      );

    case 'STATIC_SELECT': {
      return (
        <FormControlSelect
          // Used to avoid long label to be cropped when selected. Closes #65.
          // By adding this prop, it also remove the horizontal scrollbar.
          menuPortalTarget={document.body}
          name={id}
          onChange={({ payload }) => onUpdate({ name: id, value: payload })}
          value={fieldValue ? {
            label: fieldValue.label,
            value: fieldValue.id,
            payload: fieldValue,
          } : null}
          options={staticValues?.map((option) => (
            { value: option.id, label: option.label, payload: option }
          ))}
        />
      );
    }
    case 'DYNAMIC_SELECT': {
      const loadOptions = async () => {
        setError(null);

        if (!shouldBeDisplayed || !dependencyReady) {
          return [];
        }

        try {
          const { data } = await getValues();
          return data?.map((x) => ({ value: x.id, label: x.label, payload: x }));
        } catch (err) {
          setError(err.response?.data);
        }

        return [];
      };

      return (
        <FormControlSelect
          // Used to avoid long label to be cropped when selected. Closes #65.
          // By adding this prop, it also remove the horizontal scrollbar.
          menuPortalTarget={document.body}
          name={id}
          onChange={({ payload }) => onUpdate({ name: id, value: payload })}
          value={fieldValue ? {
            label: fieldValue.label,
            value: fieldValue.id,
            payload: fieldValue,
          } : null}
          isAsync
          cacheOptions
          defaultOptions
          loadOptions={loadOptions}
        />
      );
    }

    default:
      return type;
    }
  };

  if (!shouldBeDisplayed) {
    return '';
  }

  return (
    <FormGroup
      key={dependsOnValues}
      label={label}
      helper={comment}
      isOptional={!mandatory}
      validationState={error ? 'danger' : undefined}
      feedbackMessage={error ? error.message : undefined}
    >
      {getField()}
    </FormGroup>
  );
};

SmartField.propTypes = propTypes;
SmartField.defaultProps = defaultProps;
