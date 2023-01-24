import gql from "graphql-tag";

export const myProfile = gql`
    query {
        me {
            __typename
        }
    }
`;