import { Field, Int, ObjectType } from '@nestjs/graphql';

import { ImportStatus } from '../importers/types';
import { IStatusReport } from '../models/status-report';

@ObjectType()
export class ImportStatusReport implements IStatusReport {
    @Field(() => Int)
    id!: number;

    @Field(() => Int)
    groupOwnerId!: number;

    @Field()
    status!: ImportStatus;

    @Field()
    description!: string;

    @Field(() => String, { nullable: true })
    stack?: string | undefined;

    @Field(() => String, { nullable: true })
    context?: string | undefined;

    @Field()
    fileName!: string;

    @Field()
    kind!: string;
}
