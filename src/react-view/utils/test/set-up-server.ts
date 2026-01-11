import { createOpenApiHttp } from 'openapi-msw';

import { paths } from '../../api/generated-models';

export const http = createOpenApiHttp<paths>({ baseUrl: 'http://localhost/api' });
