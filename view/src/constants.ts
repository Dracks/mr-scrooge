import { ClassConstructor, plainToInstance } from 'class-transformer';

export const getDataFromScript = <T>(scriptName: string, schema: ClassConstructor<T>): T => {
    const element = document.getElementById(scriptName) ?? { textContent: '{}' };
    const obj = JSON.parse(element.textContent ?? '{}');

    return plainToInstance(schema, obj);
};

export enum Environment {
    local = 'local',
}

class JsConstants {
    environment!: Environment;

    version!: string;

    debug!: boolean;

    decimalCount!: number;
}

const constants = getDataFromScript('js-constants', JsConstants);

export const DEBUG = constants.debug ?? false;
export const GRAPHQL_URL = '/graphql/';
export const ENVIRONMENT = constants.environment;
export const VERSION = constants.version;
export const DECIMAL_COUNT = constants.decimalCount;
