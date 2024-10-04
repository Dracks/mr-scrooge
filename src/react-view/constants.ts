import { z } from 'zod';

export const getDataFromScript = <T>(scriptName: string, schema: z.Schema<T>): T => {
    const element = document.getElementById(scriptName) ?? {
        textContent: '{}',
    };
    const obj = JSON.parse(element.textContent ?? '{}');

    return schema.parse(obj);
};

const envValues = ['production', 'development'] as const;

const JsConstants = z.object({
    environment: z.enum(envValues),

    version: z.string(),

    debug: z.boolean(),

    decimalCount: z.coerce.number(),
});
type JsConstants = z.infer<typeof JsConstants>;

const constants = getDataFromScript('js-constants', JsConstants);

export const DEBUG = constants.debug ?? false;
export const GRAPHQL_URL = '/graphql/';
export const ENVIRONMENT = constants.environment;
export const VERSION = constants.version;
export const DECIMAL_COUNT = constants.decimalCount;
