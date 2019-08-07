import IMetricResults from "./IMetricResults";

// IQueryResults lists all the retrieved MetricResults together
// with the column description retrieved from the Obelisk query

export default interface IQueryResults {
    columns: string[];
    metricResults: IMetricResults[];
    addMetricResults(metricResults: IMetricResults): void;
    isEmpty(): boolean;
}
