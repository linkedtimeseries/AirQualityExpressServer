import { IQueryResults } from "../API/APIInterfaces";
import { JSONLDConfig } from "./JSONLDconfig";
import { AirQualityServerConfig } from "../AirQualityServerConfig";

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
    public buildData(): void {
        this.json = "{" + JSONLDConfig.context;
        this.json += ',"@graph":[' + this.buildFeatureOfInterest();
        this.json += ',' + this.buildObservableProperties();
        this.json += ',' + this.buildSensors();
        this.json += "]}";       
    }
    public getJSONLD(): string {
        return this.json;
    }
}