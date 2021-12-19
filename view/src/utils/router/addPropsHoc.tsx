import React from 'react';
import { ComponentType } from "react";

const addPropsHoc = <R extends {}, T extends {}>(C: ComponentType<T & R>, addProps:R)=> 
    (comProps: T) => <C {...comProps} {...addProps} /> 

export default addPropsHoc