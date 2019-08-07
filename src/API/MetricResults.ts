import IMetricResults from "./IMetricResults";

export default class MetricResults implements IMetricResults {
    public metricId: string;
    public values: Array<Array<(string | number)>>;

    constructor(metricId: string) {
        this.metricId = metricId;
        this.values = new Array();
    }

    public addValues(values: Array<(string | number)>): void {
        this.values.push(values);
    }
}
