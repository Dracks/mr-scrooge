import EventEmitter from 'events';
import React from 'react';

export enum EventTypes {
    OnFileUploaded = 'on-file-uploaded',
    OnQueueUploadFinish = 'on-queue-upload-finish',
}

class TypedEventEmitter {
    private readonly eventEmitter = new EventEmitter();

    subscribe(event: EventTypes, callback: () => Promise<void> | void): () => void {
        this.eventEmitter.addListener(event, callback);
        return () => {
            this.eventEmitter.removeListener(event, callback);
        };
    }

    emit(event: EventTypes): void {
        this.eventEmitter.emit(event);
    }
}

const EventEmitterContext = React.createContext<TypedEventEmitter>(new TypedEventEmitter());

export const useEventEmitter = () => React.useContext(EventEmitterContext);

export const ProvideEventEmitter: React.FC = ({ children }) => {
    const [emitter] = React.useState(new TypedEventEmitter());
    return <EventEmitterContext.Provider value={emitter}>{children}</EventEmitterContext.Provider>;
};
