import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import ApplicationsScreen from "../screen/candidate/ApplicationsScreen";
import JobDetailScreen from "../screen/candidate/JobDetailScreen";

const Tab = createBottomTabNavigator();

const CandidatesBottomTabs = () => {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Applications" component={ApplicationsScreen} />
            <Tab.Screen name="JobDetail" component={JobDetailScreen} />
        </Tab.Navigator>
    );
};

export default CandidatesBottomTabs;
