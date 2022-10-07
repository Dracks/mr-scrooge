import { Anchor, AnchorProps } from 'grommet';
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

export type AnchorLinkProps = Omit<LinkProps, 'to'> &
    Omit<AnchorProps, 'to'> &
    Omit<JSX.IntrinsicElements['a'], 'color'> & {
        to?: string;
    };

export const AnchorLink: React.FC<AnchorLinkProps> = ({ href, to, ...props }) => {
    return <Anchor as={props2 => <Link {...props2} to={to ?? href} />} {...props} />;
};
