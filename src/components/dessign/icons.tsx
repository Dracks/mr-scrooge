import { Icon } from 'antd'
import * as React from 'react';

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

// Others
const Dropdown = getIcon("caret-down");

export { Add, AddCircle, Dropdown, Edit, Save, Delete, Cancel, Ok, Warning, Err }