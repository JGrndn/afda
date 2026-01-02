interface FormFieldProps {
  label?: string;
  name?: string;
  type?: 'text' | 'email' | 'number' | 'date' | 'checkbox' | 'select' | 'textarea';
  value: any;
  onChange: (value: any) => void;
  options?: Array<{ value: any; label: string }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  compact?: boolean;
  error?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  helpText,
  compact = false,
  error,
}: FormFieldProps) {
  const handleChange = (e: any) => {
    if (type === 'checkbox') {
      onChange(e.target.checked);
    } else if (type === 'number') {
      onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
    } else {
      onChange(e.target.value);
    }
  };

  const inputClasses = `${compact ? '' : 'mt-1'} block w-full rounded-md shadow-sm ${
    error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
  } ${disabled ? 'bg-gray-100' : ''} ${compact ? 'text-sm py-1 px-2' : ''}`;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={compact ? 2 : 4}
          className={inputClasses}
        />
      );
    }
    
    if (type === 'select') {
      return (
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          className={inputClasses}
        >
          <option value="">{placeholder ? placeholder : 'Sélectionner...'}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }
    
    if (type === 'checkbox') {
      return (
        <div className={compact ? '' : 'mt-2'}>
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={value || false}
            onChange={handleChange}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      );
    }
    
    return (
      <input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputClasses}
      />
    );
  };

  // Mode compact pour l'édition inline
  if (compact) {
    return (
      <div>
        {renderInput()}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  // Mode formulaire normal
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}