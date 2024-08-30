import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test, TestingModule } from "@nestjs/testing";
import { FastifyInstance } from "fastify";
import request from "supertest-graphql";

import { TestDbModule } from "../../common/test-db.module";
import { getGraphQLTestModule } from "../../common/test-graphql/graph-ql.module";
import { ImporterModule } from "../importer.module";
import { NewImportService, PARSERS_TOKEN } from "../importers/importer.service";
import {
  TestBasicImporter,
  TestDynamicImporter,
} from "../importers/test-importers";
import { ImportResolver } from "./import.resolver";

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

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    server = app.getHttpAdapter().getHttpServer();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("Query data", () => {
    beforeEach(async () => {
      const importer = app.get(NewImportService);
      await importer.import(
        groupOwnerId,
        "test-account",
        "something",
        "whatever"
      );
      await importer.import(
        groupOwnerId + 1,
        "test-account",
        "something",
        "whatever"
      );
    });

    /*it("Get the list, completed", async () => {
      const query = `
                query {
                    getImports {
                        results {
                            id
                            status
                            description
                            createdAt
                            updatedAt
                        }
                        next
                    }
                }
            `;

      const response = await request<
        GQLGetImportsQuery,
        GQLGetImportsQueryVariables
      >(server).query(query);

      const result = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(result.data.getImports.results).toHaveLength(1);
      expect(result.data.getImports.results[0]).toMatchObject({
        status: "OK",
        description: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(result.data.getImports.next).toBeNull();
    });
    */
  });
});
