import React, { useState, useEffect } from 'react';

type FormFieldProps = {
  placeholder?: string;
  name: string;
  type: string;
  value: string;
  validate: (value: string) => string | undefined;
  onChange: (obj: {name: string, value: string, error: string | undefined}) => void;
  styles: string;
  required: boolean;
};

const FormField: React.FC<FormFieldProps> = ({ 
  placeholder, 
  name, 
  type, 
  value: propsValue, 
  validate,
  onChange, 
  styles, 
  required,
}) => {
  const [value, setValue] = useState(propsValue);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setValue(propsValue);
  }, [propsValue]);

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    let error = validate(value);

    setValue(value);
    setError(error);

    onChange({name, value, error});
  };

  return (
    <div className="w-full">
      <span className="text-noct-orange">{error}</span>
      <div className="flex">
        <input
          type={type}
          name={name}
          placeholder={placeholder || ''}
          value={value}
          onChange={handleChange}
          className={styles}
          onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.placeholder = ""}
        />
        {required ? <span className='text-noct-orange text-2xl pl-1'>*</span> : <div className='ml-2 pl-1'></div>}
      </div>
    </div>
  );
}
  
export default FormField;