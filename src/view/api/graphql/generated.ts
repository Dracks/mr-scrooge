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
  Date: Date;
  DateOnly: string;
  UUID: string;
};

export type GQLBankTransaction = {
  __typename?: 'BankTransaction';
  date: Scalars['DateOnly'];
  dateValue?: Maybe<Scalars['DateOnly']>;
  description?: Maybe<Scalars['String']>;
  details?: Maybe<Scalars['String']>;
  groupOwnerId: Scalars['UUID'];
  id: Scalars['UUID'];
  kind: Scalars['String'];
  labelIds: Array<Scalars['UUID']>;
  movementName: Scalars['String'];
  value: Scalars['Float'];
};

export type GQLBankTransactionResponse = {
  __typename?: 'BankTransactionResponse';
  next?: Maybe<Scalars['String']>;
  results: Array<GQLBankTransaction>;
};

export type GQLCreateLabelResponse = GQLLabel | GQLWrongOwnerId;

export type GQLCredentials = {
  password: Scalars['String'];
  username: Scalars['String'];
};

export type GQLDeleteConfirmation = {
  __typename?: 'DeleteConfirmation';
  confirm: Scalars['Boolean'];
};

export type GQLDeleteGraphResponse = GQLDeleteConfirmation | GQLGraphNotFound;

export type GQLGetBankTransactionsResponse = GQLBankTransactionResponse | GQLWrongOwnerId;

export type GQLGetImports = {
  __typename?: 'GetImports';
  next?: Maybe<Scalars['String']>;
  results: Array<GQLGqlImport>;
};

export type GQLGetImportsResponse = GQLGetImports;

export type GQLGetLabels = {
  __typename?: 'GetLabels';
  results: Array<GQLLabel>;
};

export type GQLGetLabelsResponse = GQLGetLabels;

export type GQLGqlImport = {
  __typename?: 'GqlImport';
  context?: Maybe<Scalars['String']>;
  createdAt: Scalars['Date'];
  description: Scalars['String'];
  fileName: Scalars['String'];
  groupOwnerId: Scalars['UUID'];
  id: Scalars['UUID'];
  kind: Scalars['String'];
  rows: Array<GQLGqlImportRow>;
  status: GQLImportStatus;
};

export type GQLGqlImportRow = {
  __typename?: 'GqlImportRow';
  date: Scalars['DateOnly'];
  dateValue?: Maybe<Scalars['DateOnly']>;
  description?: Maybe<Scalars['String']>;
  details?: Maybe<Scalars['String']>;
  message?: Maybe<Scalars['String']>;
  movementName: Scalars['String'];
  transactionId?: Maybe<Scalars['UUID']>;
  value: Scalars['Float'];
};

export type GQLGqlUserGroup = {
  __typename?: 'GqlUserGroup';
  id: Scalars['UUID'];
  name: Scalars['String'];
};

export type GQLGraph = {
  __typename?: 'Graph';
  dateRange: GQLGraphDateRange;
  group: GQLGroup;
  groupOwnerId: Scalars['UUID'];
  horizontalGroup?: Maybe<GQLHorizontalGroup>;
  id: Scalars['UUID'];
  kind: GQLGraphKind;
  labelFilterId?: Maybe<Scalars['UUID']>;
  name: Scalars['String'];
};

export enum GQLGraphDateRange {
  All = 'all',
  Month = 'month',
  Six = 'six',
  SixYears = 'sixYears',
  TwoYears = 'twoYears',
  Year = 'year'
}

export enum GQLGraphGroup {
  Day = 'day',
  Labels = 'labels',
  Month = 'month',
  Sign = 'sign',
  Year = 'year'
}

export enum GQLGraphKind {
  Bar = 'bar',
  Line = 'line',
  Pie = 'pie'
}

export type GQLGraphNotFound = {
  __typename?: 'GraphNotFound';
  graphId: Scalars['UUID'];
};

export type GQLGraphResponse = GQLGraph | GQLInvalidLabels | GQLWrongOwnerId;

export type GQLGroup = {
  __typename?: 'Group';
  group: GQLGraphGroup;
  hideOthers?: Maybe<Scalars['Boolean']>;
  labels?: Maybe<Array<Scalars['UUID']>>;
};

export type GQLHorizontalGroup = {
  __typename?: 'HorizontalGroup';
  accumulate?: Maybe<Scalars['Boolean']>;
  group: GQLGraphGroup;
  hideOthers?: Maybe<Scalars['Boolean']>;
  labels?: Maybe<Array<Scalars['UUID']>>;
};

export type GQLImportKind = {
  __typename?: 'ImportKind';
  name: Scalars['String'];
  regex: Scalars['String'];
};

export enum GQLImportStatus {
  Error = 'error',
  Ok = 'ok',
  Warn = 'warn'
}

export type GQLInputGroup = {
  group: GQLGraphGroup;
  hideOthers?: InputMaybe<Scalars['Boolean']>;
  labels?: InputMaybe<Array<Scalars['UUID']>>;
};

export type GQLInputHorizontalGroup = {
  accumulate?: InputMaybe<Scalars['Boolean']>;
  group: GQLGraphGroup;
  hideOthers?: InputMaybe<Scalars['Boolean']>;
  labels?: InputMaybe<Array<Scalars['UUID']>>;
};

export type GQLInvalidLabels = {
  __typename?: 'InvalidLabels';
  invalidLabels: Array<Scalars['UUID']>;
  validLabels: Array<Scalars['UUID']>;
};

export type GQLLabel = {
  __typename?: 'Label';
  groupOwnerId: Scalars['UUID'];
  id: Scalars['UUID'];
  name: Scalars['String'];
};

export type GQLLoginError = {
  __typename?: 'LoginError';
  error: Scalars['String'];
};

export type GQLLoginResponse = GQLLoginError | GQLMyProfile;

export type GQLMutation = {
  __typename?: 'Mutation';
  createLabel: GQLCreateLabelResponse;
  deleteGraph: GQLDeleteGraphResponse;
  login: GQLLoginResponse;
  logout: Scalars['Boolean'];
  newGraph: GQLGraphResponse;
  updateGraph: GQLUpdateGraphResponse;
};


export type GQLMutationCreateLabelArgs = {
  groupOwnerId?: InputMaybe<Scalars['UUID']>;
  name: Scalars['String'];
};


export type GQLMutationDeleteGraphArgs = {
  graphId: Scalars['UUID'];
};


export type GQLMutationLoginArgs = {
  credentials: GQLCredentials;
};


export type GQLMutationNewGraphArgs = {
  graph: GQLNewGraph;
};


export type GQLMutationUpdateGraphArgs = {
  graph: GQLUpdateGraph;
};

export type GQLMyProfile = {
  __typename?: 'MyProfile';
  defaultGroupId: Scalars['UUID'];
  email: Scalars['String'];
  firstName?: Maybe<Scalars['String']>;
  groups: Array<GQLGqlUserGroup>;
  id: Scalars['UUID'];
  isAdmin: Scalars['Boolean'];
  lastName?: Maybe<Scalars['String']>;
  username: Scalars['String'];
};

export type GQLMyProfileResponse = GQLMyProfile | GQLNotIdentified;

export type GQLNewGraph = {
  dateRange: GQLGraphDateRange;
  group: GQLInputGroup;
  groupOwnerId: Scalars['UUID'];
  horizontalGroup?: InputMaybe<GQLInputHorizontalGroup>;
  kind: GQLGraphKind;
  labelFilterId?: InputMaybe<Scalars['UUID']>;
  name: Scalars['String'];
};

export type GQLNotIdentified = {
  __typename?: 'NotIdentified';
  username: Scalars['String'];
};

export type GQLQuery = {
  __typename?: 'Query';
  bankTransaction: GQLGetBankTransactionsResponse;
  graphs: Array<GQLGraph>;
  importKinds: Array<GQLImportKind>;
  imports: GQLGetImportsResponse;
  labels: GQLGetLabelsResponse;
  me: GQLMyProfileResponse;
};


export type GQLQueryBankTransactionArgs = {
  cursor?: InputMaybe<Scalars['String']>;
  groupIds?: InputMaybe<Array<Scalars['UUID']>>;
  limit?: InputMaybe<Scalars['Int']>;
};


export type GQLQueryGraphsArgs = {
  graphIds?: InputMaybe<Array<Scalars['UUID']>>;
};


export type GQLQueryImportsArgs = {
  cursor?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
};

export type GQLUpdateGraph = {
  dateRange: GQLGraphDateRange;
  group: GQLInputGroup;
  groupOwnerId: Scalars['UUID'];
  horizontalGroup?: InputMaybe<GQLInputHorizontalGroup>;
  id: Scalars['UUID'];
  kind: GQLGraphKind;
  labelFilterId?: InputMaybe<Scalars['UUID']>;
  name: Scalars['String'];
};

export type GQLUpdateGraphResponse = GQLGraph | GQLGraphNotFound | GQLInvalidLabels | GQLWrongOwnerId;

export type GQLWrongOwnerId = {
  __typename?: 'WrongOwnerId';
  validOwners: Array<Scalars['UUID']>;
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
  labelFilterId
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
    fragment InvalidLabelFragment on InvalidLabels {
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
    query getBankTransactions($groupIds: [UUID!], $cursor: String, $limit: Int) {
  bankTransaction(groupIds: $groupIds, cursor: $cursor, limit: $limit) {
    ... on BankTransactionResponse {
      results {
        ...BankTransactionFragment
      }
      next
    }
  }
}
    ${BankTransactionFragmentFragmentDoc}`;

export function useGetBankTransactionsQuery(options?: Omit<Urql.UseQueryArgs<GQLGetBankTransactionsQueryVariables>, 'query'>) {
  return Urql.useQuery<GQLGetBankTransactionsQuery, GQLGetBankTransactionsQueryVariables>({ query: GetBankTransactionsDocument, ...options });
};
export const DeleteGraphDocument = gql`
    mutation deleteGraph($graphId: UUID!) {
  deleteGraph(graphId: $graphId) {
    __typename
  }
}
    `;

export function useDeleteGraphMutation() {
  return Urql.useMutation<GQLDeleteGraphMutation, GQLDeleteGraphMutationVariables>(DeleteGraphDocument);
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
    query getGraphsById($graphsIds: [UUID!]) {
  graphs(graphIds: $graphsIds) {
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
    ... on InvalidLabels {
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
    mutation updateGraph($graph: UpdateGraph!) {
  updateGraph(graph: $graph) {
    __typename
    ... on Graph {
      ...GraphFragment
    }
    ... on WrongOwnerId {
      ...WrongOwnerIdFragment
    }
    ... on InvalidLabels {
      ...InvalidLabelFragment
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
export const GetImportStatusDocument = gql`
    query getImportStatus($cursor: String, $limit: Int) {
  imports(cursor: $cursor, limit: $limit) {
    ... on GetImports {
      results {
        id
        description
        status
        context
        rows {
          movementName
          date
          dateValue
          details
          value
          description
          message
          transactionId
        }
      }
      next
    }
  }
}
    `;

export function useGetImportStatusQuery(options?: Omit<Urql.UseQueryArgs<GQLGetImportStatusQueryVariables>, 'query'>) {
  return Urql.useQuery<GQLGetImportStatusQuery, GQLGetImportStatusQueryVariables>({ query: GetImportStatusDocument, ...options });
};
export const CreateLabelDocument = gql`
    mutation CreateLabel($name: String!, $groupOwnerId: UUID) {
  createLabel(name: $name, groupOwnerId: $groupOwnerId) {
    ... on Label {
      id
      name
      groupOwnerId
    }
  }
}
    `;

export function useCreateLabelMutation() {
  return Urql.useMutation<GQLCreateLabelMutation, GQLCreateLabelMutationVariables>(CreateLabelDocument);
};
export const GetLabelsDocument = gql`
    query getLabels {
  labels {
    ... on GetLabels {
      results {
        id
        name
        groupOwnerId
      }
    }
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
export type GQLBankTransactionFragmentFragment = { __typename?: 'BankTransaction', id: string, value: number, movementName: string, date: string, description?: string | null, kind: string, labelIds: Array<string>, groupOwnerId: string };

export type GQLGetBankTransactionsQueryVariables = Exact<{
  groupIds?: InputMaybe<Array<Scalars['UUID']> | Scalars['UUID']>;
  cursor?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type GQLGetBankTransactionsQuery = { __typename?: 'Query', bankTransaction: { __typename?: 'BankTransactionResponse', next?: string | null, results: Array<{ __typename?: 'BankTransaction', id: string, value: number, movementName: string, date: string, description?: string | null, kind: string, labelIds: Array<string>, groupOwnerId: string }> } | { __typename?: 'WrongOwnerId' } };

export type GQLDeleteGraphMutationVariables = Exact<{
  graphId: Scalars['UUID'];
}>;


export type GQLDeleteGraphMutation = { __typename?: 'Mutation', deleteGraph: { __typename: 'DeleteConfirmation' } | { __typename: 'GraphNotFound' } };

export type GQLGetGraphsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetGraphsQuery = { __typename?: 'Query', graphs: Array<{ __typename?: 'Graph', id: string, name: string, kind: GQLGraphKind, labelFilterId?: string | null, dateRange: GQLGraphDateRange, groupOwnerId: string, group: { __typename?: 'Group', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<string> | null }, horizontalGroup?: { __typename?: 'HorizontalGroup', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<string> | null, accumulate?: boolean | null } | null }> };

export type GQLGetGraphsByIdQueryVariables = Exact<{
  graphsIds?: InputMaybe<Array<Scalars['UUID']> | Scalars['UUID']>;
}>;


export type GQLGetGraphsByIdQuery = { __typename?: 'Query', graphs: Array<{ __typename?: 'Graph', id: string, name: string, kind: GQLGraphKind, labelFilterId?: string | null, dateRange: GQLGraphDateRange, groupOwnerId: string, group: { __typename?: 'Group', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<string> | null }, horizontalGroup?: { __typename?: 'HorizontalGroup', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<string> | null, accumulate?: boolean | null } | null }> };

export type GQLGraphFragmentFragment = { __typename?: 'Graph', id: string, name: string, kind: GQLGraphKind, labelFilterId?: string | null, dateRange: GQLGraphDateRange, groupOwnerId: string, group: { __typename?: 'Group', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<string> | null }, horizontalGroup?: { __typename?: 'HorizontalGroup', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<string> | null, accumulate?: boolean | null } | null };

export type GQLNewGraphMutationVariables = Exact<{
  graph: GQLNewGraph;
}>;


export type GQLNewGraphMutation = { __typename?: 'Mutation', newGraph: { __typename: 'Graph', id: string, name: string, kind: GQLGraphKind, labelFilterId?: string | null, dateRange: GQLGraphDateRange, groupOwnerId: string, group: { __typename?: 'Group', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<string> | null }, horizontalGroup?: { __typename?: 'HorizontalGroup', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<string> | null, accumulate?: boolean | null } | null } | { __typename: 'InvalidLabels', invalidLabels: Array<string> } | { __typename: 'WrongOwnerId', validOwners: Array<string> } };

export type GQLUpdateGraphMutationVariables = Exact<{
  graph: GQLUpdateGraph;
}>;


export type GQLUpdateGraphMutation = { __typename?: 'Mutation', updateGraph: { __typename: 'Graph', id: string, name: string, kind: GQLGraphKind, labelFilterId?: string | null, dateRange: GQLGraphDateRange, groupOwnerId: string, group: { __typename?: 'Group', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<string> | null }, horizontalGroup?: { __typename?: 'HorizontalGroup', group: GQLGraphGroup, hideOthers?: boolean | null, labels?: Array<string> | null, accumulate?: boolean | null } | null } | { __typename: 'GraphNotFound' } | { __typename: 'InvalidLabels', invalidLabels: Array<string> } | { __typename: 'WrongOwnerId', validOwners: Array<string> } };

export type GQLGetImportKindsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetImportKindsQuery = { __typename?: 'Query', importKinds: Array<{ __typename?: 'ImportKind', name: string, regex: string }> };

export type GQLGetImportStatusQueryVariables = Exact<{
  cursor?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type GQLGetImportStatusQuery = { __typename?: 'Query', imports: { __typename?: 'GetImports', next?: string | null, results: Array<{ __typename?: 'GqlImport', id: string, description: string, status: GQLImportStatus, context?: string | null, rows: Array<{ __typename?: 'GqlImportRow', movementName: string, date: string, dateValue?: string | null, details?: string | null, value: number, description?: string | null, message?: string | null, transactionId?: string | null }> }> } };

export type GQLCreateLabelMutationVariables = Exact<{
  name: Scalars['String'];
  groupOwnerId?: InputMaybe<Scalars['UUID']>;
}>;


export type GQLCreateLabelMutation = { __typename?: 'Mutation', createLabel: { __typename?: 'Label', id: string, name: string, groupOwnerId: string } | { __typename?: 'WrongOwnerId' } };

export type GQLGetLabelsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetLabelsQuery = { __typename?: 'Query', labels: { __typename?: 'GetLabels', results: Array<{ __typename?: 'Label', id: string, name: string, groupOwnerId: string }> } };

export type GQLInvalidLabelFragmentFragment = { __typename?: 'InvalidLabels', invalidLabels: Array<string> };

export type GQLMyProfileFragmentFragment = { __typename?: 'MyProfile', email: string, firstName?: string | null, lastName?: string | null, username: string, defaultGroupId: string };

export type GQLMyProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLMyProfileQuery = { __typename?: 'Query', me: { __typename: 'MyProfile', email: string, firstName?: string | null, lastName?: string | null, username: string, defaultGroupId: string } | { __typename: 'NotIdentified' } };

export type GQLLoginMutationVariables = Exact<{
  credentials: GQLCredentials;
}>;


export type GQLLoginMutation = { __typename?: 'Mutation', login: { __typename: 'LoginError' } | { __typename: 'MyProfile', email: string, firstName?: string | null, lastName?: string | null, username: string, defaultGroupId: string } };

export type GQLWrongOwnerIdFragmentFragment = { __typename?: 'WrongOwnerId', validOwners: Array<string> };
