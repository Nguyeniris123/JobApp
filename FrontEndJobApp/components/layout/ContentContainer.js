import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

const ContentContainer = ({
  children,
  style,
  scrollable = true,
  contentContainerStyle,
  refreshControl,
}) => {
  if (scrollable) {
    return (
      <ScrollView
        style={[styles.container, style]}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, styles.contentContainer, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
});

export default ContentContainer;