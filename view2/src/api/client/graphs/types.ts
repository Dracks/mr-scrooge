
export interface Graph {
    id: number,
    name: string,
    [k:string]: string | unknown
}

export type GetGraphsResponse = Graph[]