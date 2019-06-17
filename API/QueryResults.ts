import { IQueryResults, IMetricResults } from "./APIInterfaces";

export class MetricResults implements IMetricResults {
    public metricId: string;
    public values: (string | number)[][];

    constructor(metricId: string) {
        this.metricId = metricId;
        this.values = new Array();
    }
    public AddValues(values: (string | number)[]) : void {
        this.values.push(values);
    }
}

export class QueryResults implements IQueryResults {
    public columns: string[];
    public metricResults: IMetricResults[];

    constructor() {
        this.columns = new Array();
        this.metricResults = new Array();
    }
    public AddMetricResults(metricResults: IMetricResults) : void {
        this.metricResults.push(metricResults);
    }
}