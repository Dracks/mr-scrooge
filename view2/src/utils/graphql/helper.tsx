import React from 'react'
import { UseQueryState } from 'urql'

import { LoadingPage } from '../ui/loading'
import GqlErrorHandler from './error-handler'

interface HelperProps<T> {
    query: UseQueryState<T>
    children: React.FC<{ data: T }>
}

function GqlHelper<T = any>({
    query,
    children,
}: HelperProps<T>): React.ReactElement {
    if (query.data) {
        const C = children
        return <C data={query.data} />
    } else if (query.fetching) {
        return <LoadingPage />
    } else if (query.error) {
        return <GqlErrorHandler error={query.error} />
    } else {
        return <div>No query data!</div>
    }
}

export default GqlHelper
