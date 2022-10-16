/* eslint-disable sort-keys */
import { DateRange, Graph, GraphGroupEnum, GraphKind } from '../types';

export const GraphV1Bar : Graph = {
	dateRange: DateRange.oneYear,
	kind: GraphKind.bar,
	horizontal: GraphGroupEnum.month,
	tag: 1,
	acumulative: false,
	group: GraphGroupEnum.sign,
	id: 1,
	name: "Income vs outcome"
}


export const GraphV1Line : Graph = {
	tag: 2,
	horizontal: GraphGroupEnum.day,
	group: GraphGroupEnum.month,
	kind: GraphKind.line,
	acumulative: true,
	dateRange: DateRange.halfYear,
	id: 2,
	name: "Compare by day"
}


export const GraphV1Pie : Graph  = {
	kind: GraphKind.pie,
	group:"identity",
	dateRange: DateRange.all,
	tag: 2,
	horizontal: GraphGroupEnum.tags,
	horizontalValue: [
		4,
		5,
		8,
	],
	id: 16,
	name: "Percentatge"
}
