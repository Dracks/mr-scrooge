import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyInstance } from 'fastify';
import request from 'supertest-graphql';

import { TestDbModule } from '../../common/test-db.module';
import {
    GetImportStatusDocument,
    GQLGetImportStatusQuery,
    GQLGetImportStatusQueryVariables,
} from '../../common/test-graphql/generated';
import { getGraphQLTestModule } from '../../common/test-graphql/graph-ql.module';
import { ImporterModule } from '../importer.module';
import { NewImportService, PARSERS_TOKEN } from '../importers/importer.service';
import { TestBasicImporter, TestDynamicImporter } from '../importers/test-importers';
import { ImportResolver } from './import.resolver';

const groupOwnerId = 1;

describe(ImportResolver.name, () => {
    let app!: NestFastifyApplication;
    let server!: FastifyInstance;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                TestDbModule,
                getGraphQLTestModule(() => ({
                    groupsId: [groupOwnerId],
                })),
                ImporterModule,
            ],
        })
            .overrideProvider(PARSERS_TOKEN)
            .useValue([new TestBasicImporter(), new TestDynamicImporter()])
            .compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

        await app.init();
        await app.getHttpAdapter().getInstance().ready();
        server = app.getHttpAdapter().getHttpServer();
    });

    afterEach(async () => {
        await app.close();
    });

    describe('Query data', () => {
        beforeEach(async () => {
            const importer = app.get(NewImportService);
            await importer.import(groupOwnerId, 'test-account', 'something', 'whatever');
            await importer.import(groupOwnerId + 1, 'test-account', 'something', 'whatever');
        });

        it('Get the list, completed', async () => {
            const response = await request<GQLGetImportStatusQuery, GQLGetImportStatusQueryVariables>(server).query(
                GetImportStatusDocument,
            );

            expect(response.errors).toEqual(undefined);
            const imports = response.data?.getImports;
            expect(imports?.results).toHaveLength(1);
            expect(imports?.results[0]).toMatchObject({
                status: 'OK',
                description: expect.any(String),
            });
            expect(imports?.next).toBeNull();
        });
    });
});
