import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

const AppChip = ({
  label,
  icon,
  onPress,
  selected = false,
  style,
  textStyle,
  mode = 'flat',
  disabled = false,
  closeIcon = false,
  onClose,
  ...props
}) => {
  return (
    <Chip
      mode={mode}
      selected={selected}
      onPress={onPress}
      style={[styles.chip, selected && styles.selectedChip, style]}
      textStyle={textStyle}
      icon={icon}
      disabled={disabled}
      closeIcon={closeIcon}
      onClose={onClose}
      {...props}
    >
      {label}
    </Chip>
  );
};

const styles = StyleSheet.create({
  chip: {
    margin: 4,
  },
  selectedChip: {
    backgroundColor: '#1E88E5',
  },
});

export default AppChip;