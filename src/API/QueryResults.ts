import IMetricResults from "./IMetricResults";
import IQueryResults from "./IQueryResults";

export default class QueryResults implements IQueryResults {
    public columns: string[];
    public metricResults: IMetricResults[];

    constructor() {
        this.columns = new Array();
        this.metricResults = new Array();
    }

    public addMetricResults(metricResults: IMetricResults): void {
        this.metricResults.push(metricResults);
    }

    public isEmpty(): boolean {
        if (this.columns.length === 0) {
            return true;
        }
        if (this.metricResults.length === 0) {
            return true;
        }
        return false;
    }
}
