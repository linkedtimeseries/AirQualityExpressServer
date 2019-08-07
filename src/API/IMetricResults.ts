// IMetricResults combines the retrieved values with the metricId

export default interface IMetricResults {
    metricId: string;
    values: Array<Array<(string | number)>>;
    addValues(values: Array<(string | number)>): void;
}
