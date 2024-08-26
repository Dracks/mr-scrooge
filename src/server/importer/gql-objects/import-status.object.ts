import { Field, Int, ObjectType } from "@nestjs/graphql";

import { ImportStatus } from "../importers/types";
import { IStatusReport } from "../models/status-report";

@ObjectType()
export class ImportStatusReport implements IStatusReport{
    @Field(() => Int)
    id!: number;

    groupOwnerId!: number;
    status!: ImportStatus;
    description!: string;
    stack?: string | undefined;
    context?: string | undefined;
    fileName!: string;
    kind!: string;
}
