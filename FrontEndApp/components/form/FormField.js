import React from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet } from 'react-native';
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
                    style={[styles.input, style]} 
                    {...props}
                />
            )}
            name={name}
            defaultValue={defaultValue}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        width: '100%',  // Độ rộng tối đa
        height: 55,  // Chiều cao lớn hơn
        fontSize: 13, // Chữ lớn hơn
    },
});



export default FormField;