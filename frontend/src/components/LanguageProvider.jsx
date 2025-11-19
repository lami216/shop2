import { useEffect } from "react";
import PropTypes from "prop-types";

const LanguageProvider = ({ children }) => {
        useEffect(() => {
                document.documentElement.lang = "ar";
                document.documentElement.dir = "rtl";
        }, []);

        return children;
};

export default LanguageProvider;

LanguageProvider.propTypes = {
        children: PropTypes.node.isRequired,
};
