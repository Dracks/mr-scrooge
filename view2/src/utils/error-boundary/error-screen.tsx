import React from 'react';
import { useTranslation } from 'react-i18next';

const ErrorScreen = () => {
    const { t } = useTranslation();
    return (
        <div>
            <h1>{t('There was some error, please reload')}</h1>
        </div>
    );
};

export default ErrorScreen;
