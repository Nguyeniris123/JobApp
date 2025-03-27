import React from 'react';
import { StyleSheet } from 'react-native';
import AppButton from '../ui/AppButton.js';

const FormButton = ({
    onPress,
    loading = false,
    disabled = false,
    style,
    children,
    ...props
}) => {
    return (
        <AppButton
            mode="contained"
            onPress={onPress}
            loading={loading}
            disabled={disabled || loading}
            style={[styles.button, style]}
            {...props}
        >
            {children}
        </AppButton>
    );
};

const styles = StyleSheet.create({
    button: {
        marginTop: 20,
        paddingVertical: 6,
    },
});

export default FormButton;