import { DefaultTheme } from "react-native-paper"

export const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: "#1E88E5",
        accent: "#FF8F00",
        background: "#F5F5F5",
        surface: "#FFFFFF",
        error: "#D32F2F",
        text: "#212121",
        onSurface: "#212121",
        disabled: "#9E9E9E",
        placeholder: "#9E9E9E",
        backdrop: "rgba(0, 0, 0, 0.5)",
        notification: "#FF8F00",
    },
    roundness: 8,
    fonts: {
        ...DefaultTheme.fonts,
    },
}

