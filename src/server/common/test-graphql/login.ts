import gql from "graphql-tag";

export const login = gql`
mutation login($credentials: LoginArgs!) {
    login(credentials: $credentials) {
        __typename
    }
}
`;