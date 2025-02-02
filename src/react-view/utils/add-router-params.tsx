import React from 'react';
import { useParams } from 'react-router';

import NotFound from '../contents/extra/not-found';

export type RouteParamId = {
    id: string;
};

export const routeParamsIsParamId = (data: Record<string, unknown>): data is RouteParamId => {
    if ('id' in data) {
        return typeof data['id'] === 'string';
    }
    return false;
};

export const AddRouteParams = <T extends Record<string, string> = RouteParamId>({
    check,
    child,
}: {
    check: (p: ReturnType<typeof useParams<T>>) => p is T;
    child: React.FC<T>;
}) => {
    const data = useParams<T>();
    if (check(data)) {
        const C = child;
        return <C {...data} />;
    }
    return <NotFound />;
};
