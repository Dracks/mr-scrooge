import { GraphQLScalarType, Kind } from 'graphql';

import { DateOnly } from './date-only';

export const GQLDateOnly = new GraphQLScalarType({
    name: 'DateOnly',
    description: 'Mongo object id scalar type',
    serialize(value: unknown): string {
        // check the type of received value
        if (!(value instanceof DateOnly)) {
            throw new Error('GQLDateOnly can only serialize DateOnly values');
        }
        return value.toString(); // value sent to the client
    },
    parseValue(value: unknown): DateOnly {
        // check the type of received value
        if (typeof value !== 'string') {
            throw new Error('GQLDateOnly can only parse string values');
        }
        return new DateOnly(value); // value from the client input variables
    },
    parseLiteral(ast): DateOnly {
        // check the type of received value
        if (ast.kind !== Kind.STRING) {
            throw new Error('GQLDateOnly can only parse string values');
        }
        return new DateOnly(ast.value); // value from the client query
    },
});
