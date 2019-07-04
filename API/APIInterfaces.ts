//describes the data output of the Obelisk query results together with some operations to add data and a check whether data is avialable
export interface IMetricResults {
    metricId: string,
    values: (string | number)[][]
    AddValues(values: (string | number)[]) : void
}
export interface IQueryResults {
    columns: string[],
    metricResults: IMetricResults[]
    AddMetricResults(metricResults: IMetricResults): void
    isEmpty(): boolean
}