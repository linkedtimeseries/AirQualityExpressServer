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