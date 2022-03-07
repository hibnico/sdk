import React, {
  useState, useRef, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  FormGroup,
  FormCheck,
  FormControlInput,
  FormPassword,
  FormControlSelect,
} from 'saagie-ui/react';

const propTypes = {
  onUpdate: PropTypes.func,
  formName: PropTypes.string.isRequired,
  formValues: PropTypes.object,
  contextFolderPath: PropTypes.string,
  parameter: PropTypes.object,
};

const defaultProps = {
  onUpdate: () => {},
  formValues: {},
  contextFolderPath: '',
  parameter: {},
};

export const SmartField = ({
  onUpdate = () => {},
  formValues = {},
  formName,
  contextFolderPath,
  parameter: {
    type,
    id,
    label,
    mandatory,
    comment,
    dynamicValues,
    staticValues,
    dependsOn,
    value,
    defaultValue,
  },
}) => {
  const [error, setError] = useState();

  const currentForm = formValues?.[formName] || {};

  const shouldBeDisplayed = !dependsOn || dependsOn?.every((x) => currentForm[x]);
  const dependsOnValues = JSON.stringify(dependsOn?.map((x) => currentForm[x]));

  // State for input data fetching. This is used to auto fill the inputs.
  const [formControlInputValue, setFormControlInputValue] = useState('');
  const [formControlInputLoading, setFormControlInputLoading] = useState(Boolean(value && typeof value === 'object' && value.script));

  const currentFormRef = useRef();
  currentFormRef.current = currentForm;

  const fieldValue = currentForm[id] || formControlInputValue;

  const handleFormControlInput = useCallback((e) => {
    setFormControlInputValue('');
    onUpdate({ name: id, value: e.target.value });
  }, [onUpdate, id]);

  const triggerInputDataFetching = () => {
    if (value && typeof value === 'object' && value.script && shouldBeDisplayed && formControlInputLoading) {
      const fetchValue = async () => {
        try {
          const { data } = await axios.post('/api/action', {
            script: `${contextFolderPath}/${value.script}`,
            function: value.function,
            params: {
              featuresValues: currentFormRef.current,
            },
          });

          onUpdate({ id, value: data });
        } catch (err) {
          setError(err.response?.data);
        }

        setFormControlInputLoading(false);
      };

      fetchValue();
    }
  };

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
      triggerInputDataFetching();

      return (
        <FormControlInput
          name={id}
          value={fieldValue || ''}
          autoComplete={id}
          onChange={handleFormControlInput}
          required={mandatory}
          isLoading={formControlInputLoading}
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
      const selectProps = {
        options: staticValues?.map((option) => (
          { value: option.id, label: option.label, payload: option }
        )),
      };
      return (
        <FormControlSelect
          // Used to avoid long label to be cropped when selected. Closes #65.
          // By adding this prop, it also remove the horizontal scrollbar.
          menuPortalTarget={document.body}
          name={id}
          onChange={({ payload }) => {
            onUpdate({ name: id, value: payload });
          }}
          value={fieldValue ? {
            label: fieldValue.label,
            value: fieldValue.id,
            payload: fieldValue,
          } : null}
          {...selectProps}
        />
      );
    }
    case 'DYNAMIC_SELECT': {
      const selectProps = {
        isAsync: true,
        cacheOptions: true,
        defaultOptions: true,
        loadOptions: async () => {
          setError(null);

          if (
            !shouldBeDisplayed
            || !dynamicValues
            || !dynamicValues.script
            || !dynamicValues.function
          ) {
            return dynamicValues;
          }

          try {
            const { data } = await axios.post('/api/action', {
              script: `${contextFolderPath}/${dynamicValues.script}`,
              function: dynamicValues.function,
              params: formValues,
            });

            return data?.map((x) => ({ value: x.id, label: x.label, payload: x }));
          } catch (err) {
            setError(err.response?.data);
          }

          return [];
        },
      };

      return (
        <FormControlSelect
          // Used to avoid long label to be cropped when selected. Closes #65.
          // By adding this prop, it also remove the horizontal scrollbar.
          menuPortalTarget={document.body}
          name={id}
          onChange={({ payload }) => {
            onUpdate({ name: id, value: payload });
          }}
          value={fieldValue ? {
            label: fieldValue.label,
            value: fieldValue.id,
            payload: fieldValue,
          } : null}
          {...selectProps}
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
