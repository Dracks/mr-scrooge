import { EuiText } from '@elastic/eui'
import React from 'react'
import { CombinedError } from 'urql'

interface GqlErrorHandlerProps {
    error: CombinedError
}

const GqlErrorHandler: React.FC<GqlErrorHandlerProps> = ({ error }) => {
    return (
        <EuiText>
            <h1>{error.name}</h1>
            <h2>{error.message}</h2>
            <pre>{error.stack}</pre>
        </EuiText>
    )
}

export default GqlErrorHandler
