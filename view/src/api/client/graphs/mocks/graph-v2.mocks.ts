import { GraphV2 } from '../types';

export const GraphV2Pie: Omit<GraphV2, 'id'> = {
	dateRange: "all",
	group: {
		group: "tags",
		groupTags: [
			{ tag: 4, },
			{ tag: 5, },
			{ tag: 8, },
		],
	},
	kind: "pie",
	name: "Percentatge",
	oldGraph: 16,
	tagFilter: 2,
}

export const GraphV2Line: Omit<GraphV2, 'id'> = {
	dateRange: "six",
	group: {
		group: "month",
	},
	horizontalGroup: {
		accumulate: true,
		group: "day",
	},
	kind: "line",
	name: "Compare by day",
	oldGraph: 2,
	tagFilter: 2,
}


export const GraphV2Bar: Omit<GraphV2, 'id'> = {
	dateRange: "year",
	group: {
		group: "sign",
	},
	horizontalGroup: {
		accumulate: false,
		group: "month",
	},
	kind: "bar",
	name: "Income vs outcome",
	oldGraph: 1,
	tagFilter: 1,
}