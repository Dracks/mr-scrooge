import { OperationDouble, OperationString } from '../../../api/models';

export const operationDouble: Set<OperationDouble> = new Set(['greater', 'greaterEqual', 'less', 'lessEqual']);

export const operationString: Set<OperationString> = new Set(['suffix', 'contains', 'prefix', 'regularExpression']);

export const allOperations: Array<OperationString | OperationDouble> = [
    ...operationDouble.values(),
    ...operationString.values(),
];

export const operationText: Record<OperationString | OperationDouble, string> = {
    greater: 'is greater than',
    greaterEqual: 'is greater than or equal to',
    less: 'is less than',
    lessEqual: 'is less than or equal to',
    suffix: 'ends with',
    contains: 'contains',
    prefix: 'starts with',
    regularExpression: 'matches pattern',
};

export const allOperationsTuples = allOperations.map(operation => ({
    key: operation,
    label: operationText[operation],
}));

export const isOperationDouble = (value: string): value is OperationDouble => {
    return operationDouble.has(value as OperationDouble);
};

export const isOperationString = (value: string): value is OperationString => {
    return operationString.has(value as OperationString);
};
