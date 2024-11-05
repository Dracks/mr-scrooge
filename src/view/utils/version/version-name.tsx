import React from 'react';

import { getMetaTag } from './utils';

interface HeaderContentProp {
    name: string;
}
const HeaderContent: React.FC<HeaderContentProp> = ({ name }) => {
    const versionTag = getMetaTag(name);
    if (versionTag) {
        return <React.Fragment>{versionTag.content}</React.Fragment>;
    }
    return <React.Fragment>unknown</React.Fragment>;
};

export default HeaderContent;
