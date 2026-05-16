import { useState, useCallback } from 'react';

/**
 * Custom hook for form validation.
 * @param {Object} initialValues - Initial state of the form fields.
 * @param {Function} validate - Function that takes values and returns an errors object.
 * @param {Function} onSubmit - Function to call when validation passes on submit.
 */
export const useFormValidation = (initialValues, validate, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for the field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  }, [errors]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate specific field on blur
    const validationErrors = validate(values);
    setErrors((prev) => ({
      ...prev,
      [name]: validationErrors[name] || '',
    }));
  }, [validate, values]);

  const validateForm = useCallback(() => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    
    // Mark all fields as touched to show errors
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    return Object.keys(validationErrors).length === 0;
  }, [validate, values]);

  const handleSubmit = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    if (validateForm()) {
      onSubmit(values);
    }
  }, [validateForm, onSubmit, values]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    resetForm,
    setValues,
    setErrors
  };
};
