import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

const AppButton = ({
  mode = 'contained',
  onPress,
  style,
  labelStyle,
  icon,
  loading = false,
  disabled = false,
  compact = false,
  color,
  children
}) => {
  return (
    <Button
      mode={mode}
      onPress={onPress}
      style={[styles.button, mode === 'contained' ? styles.containedButton : null, style]}
      labelStyle={labelStyle}
      icon={icon}
      loading={loading}
      disabled={disabled}
      compact={compact}
      color={color}
    >
      {children}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
  },
  containedButton: {
    elevation: 2,
  },
});

export default AppButton;