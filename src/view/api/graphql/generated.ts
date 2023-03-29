import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Mongo object id scalar type */
  DateOnly: any;
};

export type GQLBankTransaction = {
  __typename?: 'BankTransaction';
  date: Scalars['DateOnly'];
  dateValue?: Maybe<Scalars['DateOnly']>;
  description?: Maybe<Scalars['String']>;
  details?: Maybe<Scalars['String']>;
  groupOwnerId: Scalars['Int'];
  id: Scalars['Int'];
  kind: Scalars['String'];
  labelIds: Array<Scalars['Int']>;
  movementName: Scalars['String'];
  value: Scalars['Float'];
};

export type GQLCredentials = {
  password: Scalars['String'];
  username: Scalars['String'];
};

export type GQLGetBankTransactionsResponse = {
  __typename?: 'GetBankTransactionsResponse';
  next?: Maybe<Scalars['String']>;
  results: Array<GQLBankTransaction>;
};

export type GQLGraph = {
  __typename?: 'Graph';
  dateRange: GQLGraphDateRange;
  group: GQLGroup;
  groupOwnerId: Scalars['Int'];
  horizontalGroup?: Maybe<GQLHorizontalGroup>;
  id: Scalars['Int'];
  kind: GQLGraphKind;
  labelFilter?: Maybe<Scalars['Float']>;
  name: Scalars['String'];
};

export enum GQLGraphDateRange {
  All = 'all',
  HalfYear = 'halfYear',
  OneMonth = 'oneMonth',
  OneYear = 'oneYear',
  SixYears = 'sixYears',
  TwoYears = 'twoYears'
}

export enum GQLGraphGroup {
  Day = 'Day',
  Labels = 'Labels',
  Month = 'Month',
  Sign = 'Sign',
  Year = 'Year'
}

export enum GQLGraphKind {
  Bar = 'Bar',
  Line = 'Line',
  Pie = 'Pie'
}

export type GQLGroup = {
  __typename?: 'Group';
  group: GQLGraphGroup;
  hideOthers?: Maybe<Scalars['Boolean']>;
  labels?: Maybe<Array<Scalars['Int']>>;
};

export type GQLHorizontalGroup = {
  __typename?: 'HorizontalGroup';
  accumulate?: Maybe<Scalars['Boolean']>;
  group: GQLGraphGroup;
  hideOthers?: Maybe<Scalars['Boolean']>;
  labels?: Maybe<Array<Scalars['Int']>>;
};

export type GQLImportKind = {
  __typename?: 'ImportKind';
  name: Scalars['String'];
  regex: Scalars['String'];
};

export type GQLInvalidCredentials = {
  __typename?: 'InvalidCredentials';
  invalidUserOrPassword: Scalars['String'];
};

export type GQLInvalidGraph = {
  __typename?: 'InvalidGraph';
  availableGraphsId: Array<Scalars['Int']>;
};

export type GQLInvalidLabel = {
  __typename?: 'InvalidLabel';
  invalidLabels: Array<Scalars['Int']>;
};

export type GQLLabel = {
  __typename?: 'Label';
  groupOwnerId: Scalars['Float'];
  id: Scalars['Float'];
  name: Scalars['String'];
};

export type GQLLoginResponse = GQLInvalidCredentials | GQLMyProfile;

export type GQLMutateGroup = {
  group: GQLGraphGroup;
  hideOthers?: InputMaybe<Scalars['Boolean']>;
  labels?: InputMaybe<Array<Scalars['Int']>>;
};

export type GQLMutateHorizontalGroup = {
  accumulate?: InputMaybe<Scalars['Boolean']>;
  group: GQLGraphGroup;
  hideOthers?: InputMaybe<Scalars['Boolean']>;
  labels?: InputMaybe<Array<Scalars['Int']>>;
};

export type GQLMutation = {
  __typename?: 'Mutation';
  login: GQLLoginResponse;
  logout: Scalars['Boolean'];
  newGraph: GQLNewGraphResponse;
  updateGraph: GQLUpdateGraphResponse;
};


export type GQLMutationLoginArgs = {
  credentials: GQLCredentials;
};


export type GQLMutationNewGraphArgs = {
  graph: GQLNewGraph;
};


export type GQLMutationUpdateGraphArgs = {
  graph: GQLUpdatedGraph;
};

export type GQLMyProfile = {
  __typename?: 'MyProfile';
  defaultGroupId: Scalars['Int'];
  email: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  username: Scalars['String'];
};

export type GQLMyProfileResponse = GQLMyProfile | GQLNotIdentified;

export type GQLNewGraph = {
  dateRange: GQLGraphDateRange;
  group: GQLMutateGroup;
  groupOwnerId: Scalars['Int'];
  horizontalGroup?: InputMaybe<GQLMutateHorizontalGroup>;
  kind: GQLGraphKind;
  labelFilter?: InputMaybe<Scalars['Float']>;
  name: Scalars['String'];
};

export type GQLNewGraphResponse = GQLGraph | GQLInvalidLabel | GQLWrongOwnerId;

export type GQLNotIdentified = {
  __typename?: 'NotIdentified';
  identified: Scalars['Boolean'];
};

export type GQLQuery = {
  __typename?: 'Query';
  bankTransaction: GQLGetBankTransactionsResponse;
  graphs: Array<GQLGraph>;
  importKinds: Array<GQLImportKind>;
  labels: Array<GQLLabel>;
  /** Checks if a user is logged in and returns his profile */
  me: GQLMyProfileResponse;
};


export type GQLQueryBankTransactionArgs = {
  cursor?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type GQLQueryGraphsArgs = {
  graphsIds?: InputMaybe<Array<Scalars['Int']>>;
};

export type GQLUpdateGraphResponse = GQLGraph | GQLInvalidGraph | GQLInvalidLabel | GQLWrongOwnerId;

export type GQLUpdatedGraph = {
  dateRange: GQLGraphDateRange;
  group: GQLMutateGroup;
  groupOwnerId: Scalars['Int'];
  horizontalGroup?: InputMaybe<GQLMutateHorizontalGroup>;
  id: Scalars['Int'];
  kind: GQLGraphKind;
  labelFilter?: InputMaybe<Scalars['Float']>;
  name: Scalars['String'];
};

export type GQLWrongOwnerId = {
  __typename?: 'WrongOwnerId';
  validOwners: Array<Scalars['Int']>;
};

export const BankTransactionFragmentFragmentDoc = gql`
    fragment BankTransactionFragment on BankTransaction {
  id
  value
  movementName
  date
  description
  kind
  labelIds
  groupOwnerId
}
    `;
export const GraphFragmentFragmentDoc = gql`
    fragment GraphFragment on Graph {
  id
  name
  kind
  labelFilter
  dateRange
  groupOwnerId
  group {
    group
    hideOthers
    labels
  }
  horizontalGroup {
    group
    hideOthers
    labels
    accumulate
  }
}
    `;
export const InvalidLabelFragmentFragmentDoc = gql`
    fragment InvalidLabelFragment on InvalidLabel {
  invalidLabels
}
    `;
export const MyProfileFragmentFragmentDoc = gql`
    fragment MyProfileFragment on MyProfile {
  email
  firstName
  lastName
  username
  defaultGroupId
}
    `;
export const WrongOwnerIdFragmentFragmentDoc = gql`
    fragment WrongOwnerIdFragment on WrongOwnerId {
  validOwners
}
    `;
export const GetBankTransactionsDocument = gql`
    query getBankTransactions($cursor: String, $limit: Int) {
  bankTransaction(cursor: $cursor, limit: $limit) {
    results {
      ...BankTransactionFragment
    }
    next
  }
}
    ${BankTransactionFragmentFragmentDoc}`;

export function useGetBankTransactionsQuery(options?: Omit<Urql.UseQueryArgs<GQLGetBankTransactionsQueryVariables>, 'query'>) {
  return Urql.useQuery<GQLGetBankTransactionsQuery, GQLGetBankTransactionsQueryVariables>({ query: GetBankTransactionsDocument, ...options });
};
export const GetGraphsDocument = gql`
    query getGraphs {
  graphs {
    ...GraphFragment
  }
}
    ${GraphFragmentFragmentDoc}`;

export function useGetGraphsQuery(options?: Omit<Urql.UseQueryArgs<GQLGetGraphsQueryVariables>, 'query'>) {
  return Urql.useQuery<GQLGetGraphsQuery, GQLGetGraphsQueryVariables>({ query: GetGraphsDocument, ...options });
};
export const GetGraphsByIdDocument = gql`
    query getGraphsById($graphsIds: [Int!]) {
  graphs(graphsIds: $graphsIds) {
    ...GraphFragment
  }
}
    ${GraphFragmentFragmentDoc}`;

export function useGetGraphsByIdQuery(options?: Omit<Urql.UseQueryArgs<GQLGetGraphsByIdQueryVariables>, 'query'>) {
  return Urql.useQuery<GQLGetGraphsByIdQuery, GQLGetGraphsByIdQueryVariables>({ query: GetGraphsByIdDocument, ...options });
};
export const NewGraphDocument = gql`
    mutation newGraph($graph: NewGraph!) {
  newGraph(graph: $graph) {
    __typename
    ... on Graph {
      ...GraphFragment
    }
    ... on WrongOwnerId {
      ...WrongOwnerIdFragment
    }
    ... on InvalidLabel {
      ...InvalidLabelFragment
    }
  }
}
    ${GraphFragmentFragmentDoc}
${WrongOwnerIdFragmentFragmentDoc}
${InvalidLabelFragmentFragmentDoc}`;

export function useNewGraphMutation() {
  return Urql.useMutation<GQLNewGraphMutation, GQLNewGraphMutationVariables>(NewGraphDocument);
};
export const UpdateGraphDocument = gql`
    mutation updateGraph($graph: UpdatedGraph!) {
  updateGraph(graph: $graph) {
    __typename
    ... on Graph {
      ...GraphFragment
    }
    ... on WrongOwnerId {
      ...WrongOwnerIdFragment
    }
    ... on InvalidLabel {
      ...InvalidLabelFragment
    }
    ... on InvalidGraph {
      availableGraphsId
    }
  }
}
    ${GraphFragmentFragmentDoc}
${WrongOwnerIdFragmentFragmentDoc}
${InvalidLabelFragmentFragmentDoc}`;

export function useUpdateGraphMutation() {
  return Urql.useMutation<GQLUpdateGraphMutation, GQLUpdateGraphMutationVariables>(UpdateGraphDocument);
};
export const GetImportKindsDocument = gql`
    query getImportKinds {
  importKinds {
    name
    regex
  }
}
    `;

export function useGetImportKindsQuery(options?: Omit<Urql.UseQueryArgs<GQLGetImportKindsQueryVariables>, 'query'>) {
  return Urql.useQuery<GQLGetImportKindsQuery, GQLGetImportKindsQueryVariables>({ query: GetImportKindsDocument, ...options });
};
export const GetLabelsDocument = gql`
    query getLabels {
  labels {
    id
    name
    groupOwnerId
  }
}
    `;

export function useGetLabelsQuery(options?: Omit<Urql.UseQueryArgs<GQLGetLabelsQueryVariables>, 'query'>) {
  return Urql.useQuery<GQLGetLabelsQuery, GQLGetLabelsQueryVariables>({ query: GetLabelsDocument, ...options });
};
export const MyProfileDocument = gql`
    query MyProfile {
  me {
    __typename
    ... on MyProfile {
      ...MyProfileFragment
    }
  }
}
    ${MyProfileFragmentFragmentDoc}`;

export function useMyProfileQuery(options?: Omit<Urql.UseQueryArgs<GQLMyProfileQueryVariables>, 'query'>) {
  return Urql.useQuery<GQLMyProfileQuery, GQLMyProfileQueryVariables>({ query: MyProfileDocument, ...options });
};
export const LoginDocument = gql`
    mutation Login($credentials: Credentials!) {
  login(credentials: $credentials) {
    __typename
    ... on MyProfile {
      ...MyProfileFragment
    }
  }
}
    ${MyProfileFragmentFragmentDoc}`;

export function useLoginMutation() {
  return Urql.useMutation<GQLLoginMutation, GQLLoginMutationVariables>(LoginDocument);
};
export type GQLBankTransactionFragmentFragment = { __typename?: 'BankTransaction', id: number, value: number, movementName: string, date: any, description?: string | null, kind: string, labelIds: Array<number>, groupOwnerId: number };

export type GQLGetBankTransactionsQueryVariables = Exact<{
  cursor?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type GQLGetBankTransactionsQuery = { __typename?: 'Query', bankTransaction: { __typename?: 'GetBankTransactionsResponse', next?: string | null, results: Array<{ __typename?: 'BankTransaction', id: number, value: number, movementName: string, date: any, description?: string | null, kind: string, labelIds: Array<number>, groupOwnerId: number }> } };

export type GQLGetGraphsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetGraphsQuery = { __typename?: 'Query', graphs: Array<{ __typename?: 'Graph', id: number, name: string, kind: GQLGraphKind, labelFilter?: number | null, dateRange: GQLGraphDateRange, groupOwnerId: number, group: { __typename?: 'Group', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<number> | null }, horizontalGroup?: { __typename?: 'HorizontalGroup', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<number> | null, accumulate?: boolean | null } | null }> };

export type GQLGetGraphsByIdQueryVariables = Exact<{
  graphsIds?: InputMaybe<Array<Scalars['Int']> | Scalars['Int']>;
}>;


export type GQLGetGraphsByIdQuery = { __typename?: 'Query', graphs: Array<{ __typename?: 'Graph', id: number, name: string, kind: GQLGraphKind, labelFilter?: number | null, dateRange: GQLGraphDateRange, groupOwnerId: number, group: { __typename?: 'Group', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<number> | null }, horizontalGroup?: { __typename?: 'HorizontalGroup', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<number> | null, accumulate?: boolean | null } | null }> };

export type GQLGraphFragmentFragment = { __typename?: 'Graph', id: number, name: string, kind: GQLGraphKind, labelFilter?: number | null, dateRange: GQLGraphDateRange, groupOwnerId: number, group: { __typename?: 'Group', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<number> | null }, horizontalGroup?: { __typename?: 'HorizontalGroup', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<number> | null, accumulate?: boolean | null } | null };

export type GQLNewGraphMutationVariables = Exact<{
  graph: GQLNewGraph;
}>;


export type GQLNewGraphMutation = { __typename?: 'Mutation', newGraph: { __typename: 'Graph', id: number, name: string, kind: GQLGraphKind, labelFilter?: number | null, dateRange: GQLGraphDateRange, groupOwnerId: number, group: { __typename?: 'Group', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<number> | null }, horizontalGroup?: { __typename?: 'HorizontalGroup', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<number> | null, accumulate?: boolean | null } | null } | { __typename: 'InvalidLabel', invalidLabels: Array<number> } | { __typename: 'WrongOwnerId', validOwners: Array<number> } };

export type GQLUpdateGraphMutationVariables = Exact<{
  graph: GQLUpdatedGraph;
}>;


export type GQLUpdateGraphMutation = { __typename?: 'Mutation', updateGraph: { __typename: 'Graph', id: number, name: string, kind: GQLGraphKind, labelFilter?: number | null, dateRange: GQLGraphDateRange, groupOwnerId: number, group: { __typename?: 'Group', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<number> | null }, horizontalGroup?: { __typename?: 'HorizontalGroup', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<number> | null, accumulate?: boolean | null } | null } | { __typename: 'InvalidGraph', availableGraphsId: Array<number> } | { __typename: 'InvalidLabel', invalidLabels: Array<number> } | { __typename: 'WrongOwnerId', validOwners: Array<number> } };

export type GQLGetImportKindsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetImportKindsQuery = { __typename?: 'Query', importKinds: Array<{ __typename?: 'ImportKind', name: string, regex: string }> };

export type GQLGetLabelsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetLabelsQuery = { __typename?: 'Query', labels: Array<{ __typename?: 'Label', id: number, name: string, groupOwnerId: number }> };

export type GQLInvalidLabelFragmentFragment = { __typename?: 'InvalidLabel', invalidLabels: Array<number> };

export type GQLMyProfileFragmentFragment = { __typename?: 'MyProfile', email: string, firstName: string, lastName: string, username: string, defaultGroupId: number };

export type GQLMyProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLMyProfileQuery = { __typename?: 'Query', me: { __typename: 'MyProfile', email: string, firstName: string, lastName: string, username: string, defaultGroupId: number } | { __typename: 'NotIdentified' } };

export type GQLLoginMutationVariables = Exact<{
  credentials: GQLCredentials;
}>;


export type GQLLoginMutation = { __typename?: 'Mutation', login: { __typename: 'InvalidCredentials' } | { __typename: 'MyProfile', email: string, firstName: string, lastName: string, username: string, defaultGroupId: number } };

export type GQLWrongOwnerIdFragmentFragment = { __typename?: 'WrongOwnerId', validOwners: Array<number> };
