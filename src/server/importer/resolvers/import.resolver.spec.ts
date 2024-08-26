import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { Test, TestingModule } from "@nestjs/testing";
import { FastifyInstance } from "fastify";

import { TestDbModule } from "../../common/test-db.module";
import { getGraphQLTestModule } from "../../common/test-graphql/graph-ql.module";
import { ImporterModule } from "../importer.module";
import { PARSERS_TOKEN } from "../importers/importer.service";
import { ImportResolver } from "./import.resolver";

describe(ImportResolver.name, ()=>{
    let app!: NestFastifyApplication;
    let server!: FastifyInstance;

    beforeEach(async ()=>{
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                TestDbModule,
                getGraphQLTestModule(() => ({
                    groupsId: [1],
                })),
                ImporterModule
            ],
        }).overrideProvider(PARSERS_TOKEN).useValue([]).compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

        await app.init();
        await app.getHttpAdapter().getInstance().ready();
        server = app.getHttpAdapter().getHttpServer();
    })

    afterEach(async () => {
        await app.close();
    });

    describe('Query data', ()=>{
        beforeEach(()=>{

        })
    })
})
