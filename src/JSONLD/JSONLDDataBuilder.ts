// Converts the query results to JSONLD format according to the sosa standard
//  (https://www.w3.org/TR/2017/REC-vocab-ssn-20171019/)
//  step 1 - add FeatureOfInterest
//  step 2 - add ObservableProperties
//  step 3 - add Sensors
//  step 4 - add Observations
// Embed results in @graph member

import geohash = require("ngeohash");
import AirQualityServerConfig from "../AirQualityServerConfig";
import IQueryResults from "../API/IQueryResults";
import JSONLDConfig from "./JSONLDConfig";

export default class JSONLDDataBuilder {
    private QR: IQueryResults;
    private json: string = "";

    constructor(QR: IQueryResults) {
        this.QR = QR;
    }

    public buildData(): void {
        this.json += '"@graph":[' + this.buildFeatureOfInterest();
        this.json += "," + this.buildObservableProperties();
        this.json += "," + this.buildSensors();
        this.json += "," + this.buildObservations();
        this.json += "]";
    }

    public getJSONLD(): string {
        return this.json;
    }

    private buildFeatureOfInterest(): string {
        let foi: string = "{";
        foi += '"@id": "' + JSONLDConfig.baseURL + JSONLDConfig.FeatureOfInterest + '"';
        foi += ',"@type":"sosa:FeatureOfInterest"';
        foi += ',"rdfs:label":"' + JSONLDConfig.FeatureOfInterest + '"';
        foi += "}";
        return foi;
    }

    private buildObservableProperty(metricId: string): string {
        let op: string = "{";
        op += '"@id":"' + JSONLDConfig.baseURL + metricId + '"';
        op += ',"@type":"sosa:ObervableProperty"';
        op += ',"rdfs:label":"metricId.' + metricId + '"';
        op += "}";
        return op;
    }

    private buildObservableProperties(): string {
        let op: string = "";

        for (const mr of this.QR.metricResults) {
            op += "," + this.buildObservableProperty(mr.metricId);
        }
        return op.substr(1);
    }

    private buildSensor(sensorId: string, metricIds: Set<string>): string {
        let sensor: string = "{";
        sensor += '"@id":"' + JSONLDConfig.baseURL + sensorId + '"';
        sensor += ',"@type":"sosa:Sensor"';
        sensor += ',"rdfs:label":"sourceId.' + sensorId + '"';
        sensor += ',"sosa:observes":[';
        let metrics = "";
        for (const metricId of metricIds) {
            metrics += ',"' + JSONLDConfig.baseURL + metricId + '"';
        }
        sensor += metrics.substr(1);
        sensor += "]";
        sensor += "}";
        return sensor;
    }

    private buildSensors(): string {
        const colNr: number = this.QR.columns.indexOf(AirQualityServerConfig.sourceIdColumnName);
        const sensorsMap = new Map<string, Set<string>>();
        for (const mr of this.QR.metricResults) {
            for (const v of mr.values) {
                if (sensorsMap.has(v[colNr].toString())) {
                    sensorsMap.get(v[colNr].toString()).add(mr.metricId);
                } else {
                    sensorsMap.set(v[colNr].toString(), new Set<string>([mr.metricId]));
                }
            }
        }
        let s: string = "";

        for (const sensor of sensorsMap.keys()) {
            s += "," + this.buildSensor(sensor, sensorsMap.get(sensor));
        }
        return s.substr(1);
    }

    private buildObservation(
        time: (number | string),
        value: (number | string),
        sensorId: string,
        geoHash: string,
        metricId: string,
    ): string {
        const date = new Date(time);
        const latlon = geohash.decode(geoHash);
        let observation = "{";
        observation += '"@id":"' + JSONLDConfig.baseURL + metricId + "/" + sensorId + "/" + time + '"';
        observation += ',"@type":"sosa:Observation"';
        observation += ',"sosa:hasSimpleResult":' + value;
        observation += ',"sosa:resultTime":"' + date.toISOString() + '"';
        observation += ',"sosa:observedProperty":"' + JSONLDConfig.baseURL + metricId + '"';
        observation += ',"sosa:madeBySensor":"' + JSONLDConfig.baseURL + sensorId + '"';
        observation += ',"sosa:hasFeatureOfInterest":"' + JSONLDConfig.baseURL + JSONLDConfig.FeatureOfInterest + '"';
        observation += ',"geo:lat":' + latlon.latitude;
        observation += ',"geo:long":' + latlon.longitude;
        observation += "}";
        return observation;
    }

    private buildObservations(): string {
        let observations: string = "";
        const colNrTime: number = this.QR.columns.indexOf(AirQualityServerConfig.timeColumnName);
        const colNrValue: number = this.QR.columns.indexOf(AirQualityServerConfig.valueColumnName);
        const colNrSensorId: number = this.QR.columns.indexOf(AirQualityServerConfig.sourceIdColumnName);
        const colNrGeoHash: number = this.QR.columns.indexOf(AirQualityServerConfig.geoHashColumnName);

        for (const mr of this.QR.metricResults) {
            for (const v of mr.values) {
                observations += "," + this.buildObservation(
                    v[colNrTime],
                    v[colNrValue],
                    v[colNrSensorId].toString(),
                    v[colNrGeoHash].toString(),
                    mr.metricId,
                );
            }
        }
        return observations.substr(1);
    }
}
