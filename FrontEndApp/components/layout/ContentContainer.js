import { ScrollView, StyleSheet, View } from 'react-native';

const ContentContainer = ({ children, scrollable = true, style, ...props }) => {
    if (scrollable) {
        return (
            <ScrollView
                contentContainerStyle={style}
                keyboardShouldPersistTaps="handled"
                {...props}
            >
                {children}
            </ScrollView>
        );
    }
    
    return <View style={style} {...props}>{children}</View>;
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