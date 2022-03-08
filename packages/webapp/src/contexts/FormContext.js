import React, {
  createContext, useContext, useState, useCallback, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { useYAMLConfigContext } from './YAMLConfigContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {
  children: '',
};

export const FormContext = createContext();
export const useFormContext = () => useContext(FormContext);

export const FormContextProvider = ({ children }) => {
  const yaml = useYAMLConfigContext();
  const { setItem, getItem } = useLocalStorage(
    `${yaml.config?.technology?.id}.${yaml.selectedContext?.id}.formValues`,
  );

  const [formValues, setFormValues] = useState();

  const updateForm = useCallback((form) => ({ name, value }) => {
    setFormValues((state) => {
      const newState = {
        ...(state || {}),
        [form]: {
          ...(state || {})[form],
          [name]: value,
        },
      };

      setItem(newState);

      return newState;
    });
  }, [setItem]);

  const clearForm = (name) => {
    setFormValues((state) => {
      const newState = {
        ...(state || {}),
        [name]: {},
      };
      setItem(newState);
      return newState;
    });
  };

  useEffect(() => {
    const storedFormValues = getItem();

    if (storedFormValues) {
      setFormValues(storedFormValues);
    }
  }, [getItem]);

  return (
    <FormContext.Provider value={{
      formValues: formValues || {},
      updateForm,
      clearForm,
    }}
    >
      {children}
    </FormContext.Provider>
  );
};

FormContextProvider.propTypes = propTypes;
FormContextProvider.defaultProps = defaultProps;
