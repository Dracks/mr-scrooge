import React from 'react';
import { Icon } from 'antd'

const getIcon = (icon) => ()=> <Icon type={icon} />
// Actions
const Add = getIcon("plus");

const AddCircle = getIcon("plus-circle-o")

const Edit = getIcon("edit");

const Cancel = getIcon("cross");

const Save = getIcon("save");

const Delete = getIcon("delete");


// Status
const Ok = getIcon("check-circle");

const Warning = getIcon("exclamation-circle");

const Err = getIcon("cross-circle");

export { Add, AddCircle, Edit, Save, Delete, Cancel, Ok, Warning, Err }