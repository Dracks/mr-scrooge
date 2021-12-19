import { createClient } from 'urql'

import { GRAPHQL_URL } from '../../constants'

const graphQLClient = () =>
    createClient({
        url: GRAPHQL_URL,
    })

export default graphQLClient
