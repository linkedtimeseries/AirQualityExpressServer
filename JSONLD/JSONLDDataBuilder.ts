//Converts the query results to JSONLD format according to the sosa standard (https://www.w3.org/TR/2017/REC-vocab-ssn-20171019/)
//  step 1 - add FeatureOfInterest
//  step 2 - add ObservableProperties
//  step 3 - add Sensors
//  step 4 - add Observations
//Embed results in @graph member

import { IQueryResults } from "../API/APIInterfaces";
import { JSONLDConfig } from "./JSONLDconfig";
import { AirQualityServerConfig } from "../AirQualityServerConfig";
var geohash = require('ngeohash');

export class JSONLDDataBuilder {
    private QR: IQueryResults;
    private json: string="";
    constructor(QR: IQueryResults) {
        this.QR = QR;
    }
    private buildFeatureOfInterest(): string {
        let foi : string = '{'
        foi += '"@id": "' + JSONLDConfig.baseURL + JSONLDConfig.FeatureOfInterest + '"';
        foi += ',"@type":"sosa:FeatureOfInterest"';
        foi += ',"rdfs:label":"' + JSONLDConfig.FeatureOfInterest + '"';
        foi += '}';
        return foi;
    }
    private buildObservableProperty(metricId: string): string {
        let op: string = '{';
        op += '"@id":"' + JSONLDConfig.baseURL + metricId + '"';
        op += ',"@type":"sosa:ObervableProperty"';
        op += ',"rdfs:label":"metricId.' + metricId + '"';
        op += '}';
        return op;
    }
    private buildObservableProperties(): string { 
        let op: string = "";

        for (let mr of this.QR.metricResults) {
            op += "," + this.buildObservableProperty(mr.metricId);
        }
        return op.substr(1);
    }
    private buildSensor(sensorId: string,metricIds: Set<string>): string {
        let sensor: string = '{';
        sensor += '"@id":"' + JSONLDConfig.baseURL + sensorId + '"';
        sensor += ',"@type":"sosa:Sensor"';
        sensor += ',"rdfs:label":"sourceId.' + sensorId + '"';
        sensor += ',"sosa:observes":[';
        let metrics = "";
        for (let metricId of metricIds) {
            metrics += ',"'+JSONLDConfig.baseURL + metricId + '"';
        }
        sensor += metrics.substr(1);
        sensor += ']';
        sensor+='}';
        return sensor;
    }
    private buildSensors(): string {
        let colNr: number = this.QR.columns.indexOf(AirQualityServerConfig.sourceIdColumnName);
        let sensorsMap = new Map<string,Set<string>>();                
        for (let mr of this.QR.metricResults) {
            for (let v of mr.values) {
                if (sensorsMap.has(v[colNr].toString())) {
                    sensorsMap.get(v[colNr].toString()).add(mr.metricId);
                }
                else {
                    sensorsMap.set(v[colNr].toString(), new Set<string>([mr.metricId]));
                }
            }
        }
        let s: string = "";

        for (let sensor of sensorsMap.keys()) {
            s += "," + this.buildSensor(sensor, sensorsMap.get(sensor));
        }
        return s.substr(1);        
    }
    private buildObservation(time: (number|string), value:(number|string), sensorId:string, geoHash:string, metricId:string): string {
        let date = new Date(time);
        var latlon = geohash.decode(geoHash);        
        let observation = "{";
        observation += '"@id":"' + JSONLDConfig.baseURL + metricId + "/" + sensorId + "/" + time + '"';
        observation += ',"@type":"sosa:Observation"';
        observation += ',"sosa:hasSimpleResult":' + value;
        observation += ',"sosa:resultTime":"' + date.toISOString() + '"';
        observation += ',"sosa:observedProperty":"' + JSONLDConfig.baseURL + metricId + '"';
        observation += ',"sosa:madeBySensor":"' + JSONLDConfig.baseURL + sensorId + '"';
        observation += ',"sosa:hasFeatureOfInterest":"' + JSONLDConfig.baseURL + JSONLDConfig.FeatureOfInterest + '"';
        observation += ',"geo:lat":' + latlon.latitude;
        observation += ',"geo:long":'+latlon.longitude;
        observation += "}";
        return observation;
    }
    private buildObservations(): string {
        let observations: string = "";
        let colNrTime: number = this.QR.columns.indexOf(AirQualityServerConfig.timeColumnName);
        let colNrValue: number = this.QR.columns.indexOf(AirQualityServerConfig.valueColumnName);
        let colNrSensorId: number = this.QR.columns.indexOf(AirQualityServerConfig.sourceIdColumnName);
        let colNrGeoHash: number = this.QR.columns.indexOf(AirQualityServerConfig.geoHashColumnName);

        let i = 0; //temporary for testing

        for (let mr of this.QR.metricResults) {
            for (let v of mr.values) {
                observations += ',' + this.buildObservation(v[colNrTime], v[colNrValue], v[colNrSensorId].toString(), v[colNrGeoHash].toString(), mr.metricId);
                i++;
                if (i > 2) break;
            }
        }
        return observations.substr(1);
    }
    public buildData(): void {
        this.json += '"@graph":[' + this.buildFeatureOfInterest();
        this.json += ',' + this.buildObservableProperties();
        this.json += ',' + this.buildSensors();
        this.json += ',' + this.buildObservations();
        this.json += "]";    
    }
    public getJSONLD(): string {
        return this.json;
    }
}