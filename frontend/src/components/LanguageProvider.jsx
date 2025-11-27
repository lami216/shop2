import PropTypes from "prop-types";
import { I18nProvider } from "../lib/i18n";

const LanguageProvider = ({ children }) => {
        return <I18nProvider>{children}</I18nProvider>;
};

export default LanguageProvider;

LanguageProvider.propTypes = {
        children: PropTypes.node.isRequired,
};
