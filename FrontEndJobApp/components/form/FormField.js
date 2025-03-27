
import React from 'react';
import { Controller } from 'react-hook-form';
import AppInput from '../ui/AppInput.js';

const FormField = ({
    control,
    name,
    label,
    rules = {},
    defaultValue = '',
    secureTextEntry = false,
    multiline = false,
    numberOfLines = 1,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    disabled = false,
    style,
    ...props
}) => {
    return (
        <Controller
            control={control}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <AppInput
                    label={label}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!error}
                    errorText={error?.message}
                    secureTextEntry={secureTextEntry}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    disabled={disabled}
                    style={style}
                    {...props}
                />
            )}
            name={name}
            defaultValue={defaultValue}
        />
    );
};

export default FormField;