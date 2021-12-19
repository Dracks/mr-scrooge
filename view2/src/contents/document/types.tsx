import { GQLDocument } from '../../graphql/generated'

export type DocumentAlias = Omit<GQLDocument, 'originalName' | 'owner'> & {
    owner: { email: string }
}
