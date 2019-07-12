//implementation of the APIInterfaces (query results from Obelisk with metricId information)
import { IQueryResults, IMetricResults } from "./APIInterfaces";

export class MetricResults implements IMetricResults {
    public metricId: string;
    public values: (string | number)[][];

    constructor(metricId: string) {
        this.metricId = metricId;
        this.values = new Array();
    }
    public addValues(values: (string | number)[]) : void {
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
    public addMetricResults(metricResults: IMetricResults) : void {
        this.metricResults.push(metricResults);
    }
    public isEmpty(): boolean {
        if (this.columns.length == 0) return true;
        if (this.metricResults.length == 0) return true;
        return false;
    }
}