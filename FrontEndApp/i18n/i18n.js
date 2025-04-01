import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
    resources: {
        en: {
            translation: {
                // Add your English translations here
            }
        },
        vi: {
            translation: {
                // Add your Vietnamese translations here  
            }
        }
    },
    lng: "vi", // Default language
    fallbackLng: "en",
    interpolation: {
        escapeValue: false
    }
});

export default i18n;
