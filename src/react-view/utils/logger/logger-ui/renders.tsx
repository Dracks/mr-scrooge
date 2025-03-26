import React from 'react';

const RenderArray: React.FC<{ data: unknown[] }> = ({ data }) => <ul> "array({data.length})"</ul>;

const RenderObject: React.FC<{ data: object }> = ({ data }) => {
    const [show, setShow] = React.useState<boolean>(false);
    return (
        <ul>
            {' '}
            "object"{' '}
            <button
                onClick={() => {
                    setShow(!show);
                }}
            >
                show/hide
            </button>
            {show
                ? Object.entries(data).map(([key, elem]) => (
                      <li key={key}>
                          "{key}" : <RenderUnknown data={elem as unknown} />
                      </li>
                  ))
                : undefined}
        </ul>
    );
};

export const RenderUnknown: React.FC<{ data: unknown }> = ({ data }) => {
    if (!data) {
        return <>{data === null ? 'null' : 'undefined'}</>;
    }
    if (Array.isArray(data)) {
        return <RenderArray data={data} />;
    }
    switch (typeof data) {
        case 'boolean':
            return <>{data ? 'true' : 'false'}</>;
        case 'string':
            return <>{JSON.stringify(data)}</>;
        case 'object':
            return <RenderObject data={data} />;
        case 'number':
            return <> {data}</>;
        default:
            return <>{typeof data}</>;
    }
};
