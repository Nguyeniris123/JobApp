import React from 'react';
import { StyleSheet } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';

const AppInput = ({
    label,
    value,
    onChangeText,
    onBlur,
    error,
    errorText,
    style,
    secureTextEntry = false,
    multiline = false,
    numberOfLines = 1,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    disabled = false,
    left,
    right,
    placeholder,
    ...props
}) => {
    return (
        <>
            <TextInput
                label={label}
                value={value}
                onChangeText={onChangeText}
                onBlur={onBlur}
                style={[styles.input, style]}
                mode="outlined"
                secureTextEntry={secureTextEntry}
                multiline={multiline}
                numberOfLines={numberOfLines}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                disabled={disabled}
                error={!!error}
                left={left}
                right={right}
                placeholder={placeholder}
                {...props}
            />
            {error && errorText && (
                <HelperText type="error" visible={!!error}>
                    {errorText}
                </HelperText>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    input: {
        marginBottom: 12,
        backgroundColor: '#fff',
        width: '100%',
    },
});

export default AppInput;