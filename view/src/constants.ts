import { ClassConstructor, plainToInstance } from 'class-transformer';

export const getDataFromScript = <T extends {}>(scriptName: string, schema: ClassConstructor<T>): T => {
    const element = document.getElementById(scriptName) || ({} as any);
    const obj = JSON.parse(element.textContent || '{}');
    return plainToInstance(schema, obj);
};

export enum Environment {
    local = 'local',
}

class JsConstants {
    environment!: Environment;

    version!: string;

    debug!: boolean;
}

const constants = getDataFromScript('js-constants', JsConstants);

export const DEBUG = constants.debug || false;
export const GRAPHQL_URL = '/graphql/';
export const ENVIRONMENT = constants.environment;
export const VERSION = constants.version;
