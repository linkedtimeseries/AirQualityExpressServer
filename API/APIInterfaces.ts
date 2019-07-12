//IMetricResults combines the retrieved values with the metricId
//IQueryResults lists all the retrieved MetricResults together with the column description retrieved from the Obelisk query
export interface IMetricResults {
    metricId: string,
    values: (string | number)[][]
    addValues(values: (string | number)[]) : void
}
export interface IQueryResults {
    columns: string[],
    metricResults: IMetricResults[]
    addMetricResults(metricResults: IMetricResults): void
    isEmpty(): boolean
}