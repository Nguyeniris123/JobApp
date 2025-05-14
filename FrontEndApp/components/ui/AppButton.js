import { Button } from 'react-native-paper';

const AppButton = ({ children, ...props }) => {
    // Ensure children is wrapped in Text component by using Button from react-native-paper
    // which automatically handles text wrapping
    return <Button {...props}>{children}</Button>;
};

export default AppButton;