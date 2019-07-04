"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONLDconfig_1 = require("./JSONLDconfig");
const AirQualityServerConfig_1 = require("../AirQualityServerConfig");
var geohash = require('ngeohash');
class JSONLDDataBuilder {
    constructor(QR) {
        this.json = "";
        this.QR = QR;
    }
    buildFeatureOfInterest() {
        let foi = '{';
        foi += '"@id": "' + JSONLDconfig_1.JSONLDConfig.baseURL + JSONLDconfig_1.JSONLDConfig.FeatureOfInterest + '"';
        foi += ',"@type":"sosa:FeatureOfInterest"';
        foi += ',"rdfs:label":"' + JSONLDconfig_1.JSONLDConfig.FeatureOfInterest + '"';
        foi += '}';
        return foi;
    }
    buildObservableProperty(metricId) {
        let op = '{';
        op += '"@id":"' + JSONLDconfig_1.JSONLDConfig.baseURL + metricId + '"';
        op += ',"@type":"sosa:ObervableProperty"';
        op += ',"rdfs:label":"metricId.' + metricId + '"';
        op += '}';
        return op;
    }
    buildObservableProperties() {
        let op = "";
        for (let mr of this.QR.metricResults) {
            op += "," + this.buildObservableProperty(mr.metricId);
        }
        return op.substr(1);
    }
    buildSensor(sensorId, metricIds) {
        let sensor = '{';
        sensor += '"@id":"' + JSONLDconfig_1.JSONLDConfig.baseURL + sensorId + '"';
        sensor += ',"@type":"sosa:Sensor"';
        sensor += ',"rdfs:label":"sourceId.' + sensorId + '"';
        sensor += ',"sosa:observes":[';
        let metrics = "";
        for (let metricId of metricIds) {
            metrics += ',"' + JSONLDconfig_1.JSONLDConfig.baseURL + metricId + '"';
        }
        sensor += metrics.substr(1);
        sensor += ']';
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
        let s = "";
        for (let sensor of sensorsMap.keys()) {
            s += "," + this.buildSensor(sensor, sensorsMap.get(sensor));
        }
        return s.substr(1);
    }
    buildObservation(time, value, sensorId, geoHash, metricId) {
        let date = new Date(time);
        var latlon = geohash.decode(geoHash);
        let observation = "{";
        observation += '"@id":"' + JSONLDconfig_1.JSONLDConfig.baseURL + metricId + "/" + sensorId + "/" + time + '"';
        observation += ',"@type":"sosa:Observation"';
        observation += ',"sosa:hasSimpleResult":' + value;
        observation += ',"sosa:resultTime":"' + date.toISOString() + '"';
        observation += ',"sosa:observedProperty":"' + JSONLDconfig_1.JSONLDConfig.baseURL + metricId + '"';
        observation += ',"sosa:madeBySensor":"' + JSONLDconfig_1.JSONLDConfig.baseURL + sensorId + '"';
        observation += ',"sosa:hasFeatureOfInterest":"' + JSONLDconfig_1.JSONLDConfig.baseURL + JSONLDconfig_1.JSONLDConfig.FeatureOfInterest + '"';
        observation += ',"geo:lat":' + latlon.latitude;
        observation += ',"geo:long":' + latlon.longitude;
        observation += "}";
        return observation;
    }
    buildObservations() {
        let observations = "";
        let colNrTime = this.QR.columns.indexOf(AirQualityServerConfig_1.AirQualityServerConfig.timeColumnName);
        let colNrValue = this.QR.columns.indexOf(AirQualityServerConfig_1.AirQualityServerConfig.valueColumnName);
        let colNrSensorId = this.QR.columns.indexOf(AirQualityServerConfig_1.AirQualityServerConfig.sourceIdColumnName);
        let colNrGeoHash = this.QR.columns.indexOf(AirQualityServerConfig_1.AirQualityServerConfig.geoHashColumnName);
        //let i = 0; //temporary for testing
        for (let mr of this.QR.metricResults) {
            for (let v of mr.values) {
                observations += ',' + this.buildObservation(v[colNrTime], v[colNrValue], v[colNrSensorId].toString(), v[colNrGeoHash].toString(), mr.metricId);
                //i++;
                //if (i > 2) break;
            }
        }
        return observations.substr(1);
    }
    buildData() {
        this.json += '"@graph":[' + this.buildFeatureOfInterest();
        this.json += ',' + this.buildObservableProperties();
        this.json += ',' + this.buildSensors();
        this.json += ',' + this.buildObservations();
        this.json += "]";
    }
    getJSONLD() {
        return this.json;
    }
}
exports.JSONLDDataBuilder = JSONLDDataBuilder;
//# sourceMappingURL=JSONLDDataBuilder.js.map