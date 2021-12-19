export const getDataFromScript = <T extends {}>(scriptName: string): T => {
    const element = document.getElementById(scriptName) || ({} as any)
    return JSON.parse(element.textContent || '{}')
}

export enum Environment {
    local = 'local',
}

interface JsContants {
    environment: Environment
    version: string
    debug: boolean
    static_url: string
    pageLoadTraceId: string
    pageLoadSpanId: string
    pageLoadSampled: boolean
}

const constants = getDataFromScript<JsContants>('js-constants')

export const DEBUG = constants.debug || false
export const GRAPHQL_URL = '/graphql/'
export const STATIC_URL = constants.static_url
export const ENVIRONMENT = constants.environment

export const APM = {
    version: constants.version,
    pageLoadTraceId: constants.pageLoadTraceId,
    pageLoadSpanId: constants.pageLoadSpanId,
    pageLoadSampled: constants.pageLoadSampled,
}
