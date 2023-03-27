import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';

import { DateOnly } from '../custom-types/date-only';
import { GQLDateOnly } from '../custom-types/gql-date-only';

export const getGraphQLTestModule = (ctxFactory: (e?: unknown) => Record<string, unknown>) =>
    GraphQLModule.forRoot<MercuriusDriverConfig>({
        autoSchemaFile: `/tmp/mr-scrooge-tests/${Math.random()}.gql`,
        buildSchemaOptions: {
            scalarsMap: [{ type: DateOnly, scalar: GQLDateOnly }],
        },
        context: ctxFactory,
        driver: MercuriusDriver,
        graphiql: false,
    });
