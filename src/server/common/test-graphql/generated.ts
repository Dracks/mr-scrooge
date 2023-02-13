import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    Boolean: boolean;
    /** Mongo object id scalar type */
    DateOnly: any;
    Float: number;
    ID: string;
    Int: number;
    String: string;
};

export type GQLBankTransaction = {
    __typename?: 'BankTransaction';
    date: Scalars['DateOnly'];
    dateValue?: Maybe<Scalars['DateOnly']>;
    description?: Maybe<Scalars['String']>;
    details?: Maybe<Scalars['String']>;
    id: Scalars['Int'];
    kind: Scalars['String'];
    movementName: Scalars['String'];
    value: Scalars['Float'];
};

export type GQLCredentials = {
    password: Scalars['String'];
    username: Scalars['String'];
};

export type GQLGetBankTransactionsResponse = {
    __typename?: 'GetBankTransactionsResponse';
    cursor?: Maybe<Scalars['String']>;
    transactions: Array<GQLBankTransaction>;
};

export type GQLInvalidCredentials = {
    __typename?: 'InvalidCredentials';
    invalidUserOrPassword: Scalars['String'];
};

export type GQLLabel = {
    __typename?: 'Label';
    id: Scalars['Float'];
    name: Scalars['String'];
};

export type GQLLoginResponse = GQLInvalidCredentials | GQLMyProfile;

export type GQLMutation = {
    __typename?: 'Mutation';
    login: GQLLoginResponse;
    logout: Scalars['Boolean'];
};

export type GQLMutationLoginArgs = {
    credentials: GQLCredentials;
};

export type GQLMyProfile = {
    __typename?: 'MyProfile';
    email: Scalars['String'];
    firstName: Scalars['String'];
    lastName: Scalars['String'];
    username: Scalars['String'];
};

export type GQLMyProfileResponse = GQLMyProfile | GQLNotIdentified;

export type GQLNotIdentified = {
    __typename?: 'NotIdentified';
    identified: Scalars['Boolean'];
};

export type GQLQuery = {
    __typename?: 'Query';
    bankTransaction: GQLGetBankTransactionsResponse;
    label: Array<GQLLabel>;
    /** Checks if a user is logged in and returns his profile */
    me: GQLMyProfileResponse;
};

export type GQLQueryBankTransactionArgs = {
    cursor?: InputMaybe<Scalars['String']>;
    limit?: InputMaybe<Scalars['Int']>;
};

export const MyProfileFragmentFragmentDoc = gql`
    fragment MyProfileFragment on MyProfile {
        email
        firstName
        lastName
        username
    }
`;
export const MyProfileDocument = gql`
    query MyProfile {
        me {
            __typename
            ... on MyProfile {
                ...MyProfileFragment
            }
        }
    }
    ${MyProfileFragmentFragmentDoc}
`;
export const GetBankTransactionsDocument = gql`
    query getBankTransactions($cursor: String, $limit: Int) {
        bankTransaction(cursor: $cursor, limit: $limit) {
            transactions {
                id
                value
                movementName
                date
            }
            cursor
        }
    }
`;
export const LoginDocument = gql`
    mutation Login($credentials: Credentials!) {
        login(credentials: $credentials) {
            __typename
            ... on MyProfile {
                ...MyProfileFragment
            }
        }
    }
    ${MyProfileFragmentFragmentDoc}
`;
export const GetLabelsDocument = gql`
    query getLabels {
        label {
            id
            name
        }
    }
`;
export type GQLMyProfileFragmentFragment = {
    __typename?: 'MyProfile';
    email: string;
    firstName: string;
    lastName: string;
    username: string;
};

export type GQLMyProfileQueryVariables = Exact<{ [key: string]: never }>;

export type GQLMyProfileQuery = {
    __typename?: 'Query';
    me:
        | { __typename: 'MyProfile'; email: string; firstName: string; lastName: string; username: string }
        | { __typename: 'NotIdentified' };
};

export type GQLGetBankTransactionsQueryVariables = Exact<{
    cursor?: InputMaybe<Scalars['String']>;
    limit?: InputMaybe<Scalars['Int']>;
}>;

export type GQLGetBankTransactionsQuery = {
    __typename?: 'Query';
    bankTransaction: {
        __typename?: 'GetBankTransactionsResponse';
        cursor?: string | null;
        transactions: Array<{
            __typename?: 'BankTransaction';
            date: any;
            id: number;
            movementName: string;
            value: number;
        }>;
    };
};

export type GQLLoginMutationVariables = Exact<{
    credentials: GQLCredentials;
}>;

export type GQLLoginMutation = {
    __typename?: 'Mutation';
    login:
        | { __typename: 'InvalidCredentials' }
        | { __typename: 'MyProfile'; email: string; firstName: string; lastName: string; username: string };
};

export type GQLGetLabelsQueryVariables = Exact<{ [key: string]: never }>;

export type GQLGetLabelsQuery = {
    __typename?: 'Query';
    label: Array<{ __typename?: 'Label'; id: number; name: string }>;
};
