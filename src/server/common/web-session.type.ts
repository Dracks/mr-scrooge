import * as secureSession from '@fastify/secure-session';

export interface SessionData {
    userId: string
    sessionId: string
}

export type WebSession = secureSession.Session<SessionData>