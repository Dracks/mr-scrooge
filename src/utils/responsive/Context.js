import React from 'react';

export const getObjectResponsive = (size)=>(
    {viewportWidth: size}
)
export default React.createContext(getObjectResponsive(0))