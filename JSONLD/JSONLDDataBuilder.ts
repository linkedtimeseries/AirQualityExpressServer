import { IQueryResults } from "../API/APIInterfaces";
import { JSONLDConfig } from "./JSONLDconfig";
import { AirQualityServerConfig } from "../AirQualityServerConfig";
var geohash = require('ngeohash');

export class JSONLDDataBuilder {
    private QR: IQueryResults;
    private json: string;
    constructor(QR: IQueryResults) {
        this.QR = QR;
    }
    private buildFeatureOfInterest(): string {
        return '{ "@id":"' + JSONLDConfig.baseURL + JSONLDConfig.FeatureOfInterest + '","@type":"sosa:FeatureOfInterest","rdfs:label":"' + JSONLDConfig.FeatureOfInterest+'"}';
    }
    private buildObservableProperty(metricId: string): string {
        return '{"@id":"' + JSONLDConfig.baseURL + metricId + '","@type":"sosa:ObervableProperty","rdfs:label":"metricId.' + metricId + '"}';
    }
    private buildObservableProperties(): string { //add check if no data 
        let op: string = "";
        op = this.buildObservableProperty(this.QR.metricResults[0].metricId);
        for (let i = 1; i < this.QR.metricResults.length; i++) {
            op += "," + this.buildObservableProperty(this.QR.metricResults[i].metricId);
        }       
        return op;
    }
    private buildSensor(sensorId: string,metricIds: Set<string>): string {
        let sensor = '{"@id":"' + JSONLDConfig.baseURL + sensorId
            + '","@type":"sosa:Sensor","rdfs:label":"sourceId.' + sensorId + '"';
        for (let metricId of metricIds) {
            sensor+= ',"sosa:observes":"' + JSONLDConfig.baseURL + metricId + '"'
        }
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
        console.log(sensorsMap);
        let sensors:string[] = Array.from(sensorsMap.keys());
        console.log(sensors);
        let s: string = "";
        s = this.buildSensor(sensors[0], sensorsMap.get(sensors[0]));
        for (let i = 1; i < sensors.length; i++) {
            s += "," + this.buildSensor(sensors[i], sensorsMap.get(sensors[i]));
        }
        return s;        
    }
    private buildObservation(time: (number|string), value:(number|string), sensorId:string, geoHash:string, metricId:string): string {
        let date = new Date(time);
        var latlon = geohash.decode(geoHash);        
        let observation = "{";
        observation += '"@id":"' + JSONLDConfig.baseURL + metricId + "/" + sensorId + "/" + time + '"';
        observation += ',"@type":"sosa:Observation"';
        observation += ',"sosa:hasSimpleResult":' + value;
        observation += ',"sosa:resultTime":"' + date.toISOString() + '"';
        observation += ',"sosa:observedPoperty":"' + JSONLDConfig.baseURL + metricId + '"';
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

        let i = 0;

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
        this.json = "{" + JSONLDConfig.context;
        this.json += ',"@graph":[' + this.buildFeatureOfInterest();
        this.json += ',' + this.buildObservableProperties();
        this.json += ',' + this.buildSensors();
        this.json += ',' + this.buildObservations();
        this.json += "]}";       
    }
    public getJSONLD(): string {
        return this.json;
    }
}