import gql from 'graphql-tag';

export const login = gql`
    mutation login($credentials: Credentials!) {
        login(credentials: $credentials) {
            __typename
        }
    }
`;
