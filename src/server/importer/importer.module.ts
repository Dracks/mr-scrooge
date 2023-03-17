import { Module } from "@nestjs/common";

import { ImportKindResolver } from "./resolvers/import-kind.resolver";

@Module({
    providers: [ImportKindResolver]
})
export class ImporterModule{}
