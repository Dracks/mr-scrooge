export interface SessionData {
    groupsId: number[],
    sessionId: string;
    userId: number;
}

export interface WebSession {
    changed: boolean;
    data(): SessionData | undefined;
    delete(): void;
    deleted: boolean;
    get<Key extends keyof SessionData>(key: Key): SessionData[Key] | undefined;
    set<Key extends keyof SessionData>(key: Key, value: SessionData[Key] | undefined): void;
}

// export type WebSession = secureSession.Session<SessionData>