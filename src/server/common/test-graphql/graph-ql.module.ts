import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';

import { DateOnly } from '../custom-types/date-only';
import { GQLDateOnly } from '../custom-types/gql-date-only';

export const getGraphQLTestModule = (ctxFactory: (e?: unknown) => Record<string, unknown>) =>
    GraphQLModule.forRoot<MercuriusDriverConfig>({
        driver: MercuriusDriver,
        graphiql: false,
        autoSchemaFile: `/tmp/mr-scrooge-tests/${Math.random()}.gql`,
        context: ctxFactory,
        buildSchemaOptions: {
            scalarsMap: [{ type: DateOnly, scalar: GQLDateOnly }],
        },
    });
