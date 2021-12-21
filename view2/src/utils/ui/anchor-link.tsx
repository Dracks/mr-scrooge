import React from 'react';
import { Link } from 'react-router-dom'
import { Anchor, AnchorExtendedProps } from 'grommet'

const CastAnchor = Anchor as React.FC<AnchorExtendedProps & {tag: 'span'}>
export const AnchorLink : React.FC<Omit<AnchorExtendedProps, 'tag'>> = ({href, ...others})=><Link to={href}>
        <CastAnchor
            tag='span'
            {...others} />
    </Link>