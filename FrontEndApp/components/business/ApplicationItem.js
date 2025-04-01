import React from 'react';
import { StyleSheet } from 'react-native';
import ApplicationCard from './ApplicationCard';

const ApplicationItem = ({ application, onPress, onViewJob, onContact, style }) => {
    return (
        <ApplicationCard
            application={application}
            onPress={onPress}
            onViewJob={onViewJob}
            onContact={onContact} 
            style={style}
        />
    );
};

const styles = StyleSheet.create({
    // Inherit styles from ApplicationCard
});

export default ApplicationItem;
