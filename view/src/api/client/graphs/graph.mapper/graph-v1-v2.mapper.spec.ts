import { GraphV1Bar, GraphV1Line, GraphV1Pie } from '../mocks/graph-v1.mocks';
import { GraphV2Bar,GraphV2Line,GraphV2Pie } from '../mocks/graph-v2.mocks';
import { graphV1V2Mapper } from './graph-v1-v2.mapper';

describe('graph v1 to v2 mapper', () => {
	it.each([
		[
			"Pie Graph",
			GraphV1Pie,
			GraphV2Pie,
		],
		[
			"Line Graph",
			GraphV1Line,
			GraphV2Line,
		],
		[
			"Bar Graph",
			GraphV1Bar,
			GraphV2Bar,
		],
	])("check transform %s", (_summary, graphv1, graphv2) => {
		expect(graphV1V2Mapper(graphv1 )).toEqual(graphv2)
	})
})