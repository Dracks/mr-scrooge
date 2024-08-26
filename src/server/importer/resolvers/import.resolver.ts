import { Inject } from "@nestjs/common";
import { Args, Field, Int, ObjectType, Query, Resolver } from "@nestjs/graphql";

import { GetPageResponse } from "../../common/graphql/pagination";
import { GqlGroupsId } from "../../session";
import { ImportKind } from "../gql-objects/import-kind.object";
import { ImportStatusReport } from "../gql-objects/import-status.object";
import { ParserFactory, PARSERS_TOKEN } from "../importers/importer.service";
import { StatusReportsService } from "../importers/status-reports.service";

@ObjectType()
export class GetImportStatusReportResponse extends GetPageResponse<ImportStatusReport> {
    @Field(() => [ImportStatusReport])
    results!: ImportStatusReport[];
}

@Resolver()
export class ImportResolver {
    private importKindList : ImportKind[]

    constructor(private readonly reportService: StatusReportsService, @Inject(PARSERS_TOKEN) parsers: ParserFactory[]) {
        this.importKindList = parsers.map(parser => ({
            name: parser.key,
            regex: parser.fileRegex.toString(),
        } satisfies ImportKind))
    }

    @Query(()=>GetImportStatusReportResponse)
    async getImporters(@GqlGroupsId() groupIds: number[],@Args('cursor', { nullable: true }) oldCursor: string,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,): Promise<GetImportStatusReportResponse>{
        const { next, list} = await this.reportService.getAll(groupIds, oldCursor, limit)
        return {
            results: list.map((report) => report),
            next
        }
    }

    @Query(()=>[ImportKind])
    importKinds():ImportKind[]{
        return this.importKindList
    }
}
