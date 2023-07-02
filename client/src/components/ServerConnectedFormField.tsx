import React, { useState, useEffect } from 'react';

type ServerConnectedFormFieldProps = {
  placeholder?: string;
  name: string;
  type: string;
  value: string;
  validate: (value: string) => string | undefined;
  onChange: (obj: {name: string, value: string, error: string | undefined}) => void;
  styles: string;
  serverFunction: Function;
  required: boolean;
};

const ServerConnectedFormField: React.FC<ServerConnectedFormFieldProps> = ({ 
  placeholder, 
  name, 
  type, 
  value: propsValue, 
  validate, 
  onChange, 
  styles, 
  serverFunction, 
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

  const handleBlur = async (evt: React.FocusEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    let error = validate(value);
    
    if (name === 'email') {
      const res = await fetch(serverFunction({email: value}));
      const json = await res.json();
      if (json.err.length) {
        error = json.err;
        setValue(value);
        setError(error);
        onChange({name, value, error});
      } else {
        error = undefined;
        setValue(value);
        setError(error);
        onChange({name, value, error});
      }
    };
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
          onBlur={handleBlur}
        />
        {required ? <span className='text-noct-orange text-2xl pl-1'>*</span> : <div className='ml-2 pl-1'></div>}
      </div>
    </div>
  );
}
  
export default ServerConnectedFormField;