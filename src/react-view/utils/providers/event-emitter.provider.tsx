import EventEmitter from 'events';
import React, { PropsWithChildren } from 'react';

export enum EventTypes {
    OnFileUploaded = 'on-file-uploaded',
    OnQueueUploadFinish = 'on-queue-upload-finish',
}

class TypedEventEmitter {
    private readonly eventEmitter = new EventEmitter();

    subscribe(event: EventTypes, callback: () => Promise<void> | void): () => void {
        const _callback = () => {
            callback()?.catch((error: unknown) => { console.error(error) });
        };
        this.eventEmitter.addListener(event, _callback);
        return () => {
            this.eventEmitter.removeListener(event, _callback);
        };
    }

    emit(event: EventTypes): void {
        this.eventEmitter.emit(event);
    }
}

const EventEmitterContext = React.createContext<TypedEventEmitter>(new TypedEventEmitter());

export const useEventEmitter = () => React.useContext(EventEmitterContext);

export const ProvideEventEmitter: React.FC<PropsWithChildren> = ({ children }) => {
    const [emitter] = React.useState(new TypedEventEmitter());
    return <EventEmitterContext.Provider value={emitter}>{children}</EventEmitterContext.Provider>;
};
