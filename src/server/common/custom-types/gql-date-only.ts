/* eslint-disable sort-keys */
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
        // value sent to the client
        return value.toString();
    },
    parseValue(value: unknown): DateOnly {
        // check the type of received value
        if (typeof value !== 'string') {
            throw new Error('GQLDateOnly can only parse string values');
        }
        // value from the client input variables
        return new DateOnly(value);
    },
    parseLiteral(ast): DateOnly {
        // check the type of received value
        if (ast.kind !== Kind.STRING) {
            throw new Error('GQLDateOnly can only parse string values');
        }
        // value from the client query
        return new DateOnly(ast.value);
    },
});
