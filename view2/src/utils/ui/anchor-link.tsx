import React from 'react';
import { Link, LinkProps } from 'react-router-dom'
import { Anchor, AnchorProps } from 'grommet'
/*
const CastAnchor = Anchor as React.FC<AnchorExtendedProps & {tag: 'span'}>

export const AnchorLink : React.FC<Omit<AnchorExtendedProps, 'tag' | 'href' > & {href: string}> = ({href, ...others})=><Link to={href}>
        <CastAnchor
            tag='span'
            {...others} />
    </Link>

*/

export const AnchorLink: React.FC<AnchorLinkProps> = ({href, to, ...props}) => {
  return <Anchor as={(props)=><Link {...props} to={to ?? href} />} {...props} />
}

export type AnchorLinkProps = LinkProps &
  AnchorProps &
  Omit<JSX.IntrinsicElements['a'], 'color'>