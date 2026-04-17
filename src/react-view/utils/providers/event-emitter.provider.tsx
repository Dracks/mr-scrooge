import React, { PropsWithChildren } from 'react';

export enum EventTypes {
    OnFileUploaded = 'on-file-uploaded',
    OnQueueUploadFinish = 'on-queue-upload-finish',
}

console.log("Daleks everywhere")

class TypedEventEmitter {
    private readonly eventEmitter = new EventTarget();

    subscribe(event: EventTypes, callback: () => Promise<void> | void): () => void {
        const _callback = () => {
            callback()?.catch((error: unknown) => {
                console.error(error);
            });
        };
        this.eventEmitter.addEventListener(event, _callback);
        return () => {
            this.eventEmitter.removeEventListener(event, _callback);
        };
    }

    emit(event: EventTypes): void {
        this.eventEmitter.dispatchEvent(new Event(event));
    }
}

const EventEmitterContext = React.createContext<TypedEventEmitter>(new TypedEventEmitter());

export const useEventEmitter = () => React.useContext(EventEmitterContext);

export const ProvideEventEmitter: React.FC<PropsWithChildren> = ({ children }) => {
    const [emitter] = React.useState(new TypedEventEmitter());
    return <EventEmitterContext.Provider value={emitter}>{children}</EventEmitterContext.Provider>;
};
