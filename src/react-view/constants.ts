import { z } from 'zod';

export const getDataFromScript = <T>(scriptName: string, schema: z.Schema<T>): T => {
    const element: { textContent?: string | null } = document.getElementById(scriptName) ?? {};
    const obj = JSON.parse(element.textContent ?? '{}') as unknown;

    return schema.parse(obj);
};

const envValues = ['production', 'development'] as const;

const JsConstants = z.object({
    environment: z.enum(envValues),

    version: z.string(),

    commit: z.string(),

    debug: z.boolean(),

    decimalCount: z.coerce.number(),
});
type JsConstants = z.infer<typeof JsConstants>;

const constants = getDataFromScript('js-constants', JsConstants);

export const DEBUG = constants.debug;
export const GRAPHQL_URL = '/graphql/';
export const ENVIRONMENT = constants.environment;
export const VERSION = constants.version;
export const DECIMAL_COUNT = constants.decimalCount;
export const TRANSACTION_REFRESH_RATE = 2000
