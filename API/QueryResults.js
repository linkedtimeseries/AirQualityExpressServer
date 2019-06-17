"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MetricResults {
    constructor(metricId) {
        this.metricId = metricId;
        this.values = new Array();
    }
    AddValues(values) {
        this.values.push(values);
    }
}
exports.MetricResults = MetricResults;
class QueryResults {
    constructor() {
        this.columns = new Array();
        this.metricResults = new Array();
    }
    AddMetricResults(metricResults) {
        this.metricResults.push(metricResults);
    }
}
exports.QueryResults = QueryResults;
//# sourceMappingURL=QueryResults.js.map