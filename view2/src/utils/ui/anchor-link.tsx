import React from 'react';
import { Link, LinkProps } from 'react-router-dom'
import { Anchor, AnchorProps } from 'grommet'

export type AnchorLinkProps = Omit<LinkProps, 'to'> &
  Omit<AnchorProps, 'to'> &
  Omit<JSX.IntrinsicElements['a'], 'color'> & {
    to?: string
  }

export const AnchorLink: React.FC<AnchorLinkProps> = ({href, to, ...props}) => {
  return <Anchor as={(props)=><Link {...props} to={to ?? href} />} {...props} />
}

