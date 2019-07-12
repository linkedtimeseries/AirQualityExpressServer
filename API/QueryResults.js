"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MetricResults {
    constructor(metricId) {
        this.metricId = metricId;
        this.values = new Array();
    }
    addValues(values) {
        this.values.push(values);
    }
}
exports.MetricResults = MetricResults;
class QueryResults {
    constructor() {
        this.columns = new Array();
        this.metricResults = new Array();
    }
    addMetricResults(metricResults) {
        this.metricResults.push(metricResults);
    }
    isEmpty() {
        if (this.columns.length == 0)
            return true;
        if (this.metricResults.length == 0)
            return true;
        return false;
    }
}
exports.QueryResults = QueryResults;
//# sourceMappingURL=QueryResults.js.map