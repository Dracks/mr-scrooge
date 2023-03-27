/* eslint-disable class-methods-use-this */
import { Query, Resolver } from "@nestjs/graphql";

import { ImportKind } from "../gql-objects/import-kind.object";

@Resolver()
export class ImportKindResolver {
    @Query(()=>[ImportKind])
    importKinds():ImportKind[]{
        return [
            {
                name: 'demo',
                regex: ''
            },
            {
                name: 'test',
                regex: ''
            },
        ]
    }
}
