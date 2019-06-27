"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONLDconfig_1 = require("./JSONLDconfig");
const AirQualityServerConfig_1 = require("../AirQualityServerConfig");
class JSONLDDataBuilder {
    constructor(QR) {
        this.QR = QR;
    }
    buildFeatureOfInterest() {
        return '{ "@id":"' + JSONLDconfig_1.JSONLDConfig.baseURL + JSONLDconfig_1.JSONLDConfig.FeatureOfInterest + '","@type":"sosa:FeatureOfInterest","rdfs:label":"' + JSONLDconfig_1.JSONLDConfig.FeatureOfInterest + '"}';
    }
    buildObservableProperty(metricId) {
        return '{"@id":"' + JSONLDconfig_1.JSONLDConfig.baseURL + metricId + '","@type":"sosa:ObervableProperty","rdfs:label":"metricId.' + metricId + '"}';
    }
    buildObservableProperties() {
        let op = "";
        op = this.buildObservableProperty(this.QR.metricResults[0].metricId);
        for (let i = 1; i < this.QR.metricResults.length; i++) {
            op += "," + this.buildObservableProperty(this.QR.metricResults[i].metricId);
        }
        return op;
    }
    buildSensor(sensorId, metricIds) {
        let sensor = '{"@id":"' + JSONLDconfig_1.JSONLDConfig.baseURL + sensorId
            + '","@type":"sosa:Sensor","rdfs:label":"sourceId.' + sensorId + '"';
        for (let metricId of metricIds) {
            sensor += ',"sosa:observes":"' + JSONLDconfig_1.JSONLDConfig.baseURL + metricId + '"';
        }
        sensor += '}';
        return sensor;
    }
    buildSensors() {
        let colNr = this.QR.columns.indexOf(AirQualityServerConfig_1.AirQualityServerConfig.sourceIdColumnName);
        let sensorsMap = new Map();
        for (let mr of this.QR.metricResults) {
            for (let v of mr.values) {
                if (sensorsMap.has(v[colNr].toString())) {
                    sensorsMap.get(v[colNr].toString()).add(mr.metricId);
                }
                else {
                    sensorsMap.set(v[colNr].toString(), new Set([mr.metricId]));
                }
            }
        }
        console.log(sensorsMap);
        let sensors = Array.from(sensorsMap.keys());
        console.log(sensors);
        let s = "";
        s = this.buildSensor(sensors[0], sensorsMap.get(sensors[0]));
        for (let i = 1; i < sensors.length; i++) {
            s += "," + this.buildSensor(sensors[i], sensorsMap.get(sensors[i]));
        }
        return s;
    }
    buildData() {
        this.json = "{" + JSONLDconfig_1.JSONLDConfig.context;
        this.json += ',"@graph":[' + this.buildFeatureOfInterest();
        this.json += ',' + this.buildObservableProperties();
        this.json += ',' + this.buildSensors();
        this.json += "]}";
    }
    getJSONLD() {
        return this.json;
    }
}
exports.JSONLDDataBuilder = JSONLDDataBuilder;
//# sourceMappingURL=JSONLDDataBuilder.js.map