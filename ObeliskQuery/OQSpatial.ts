import { ObeliskClientAuthentication } from "../utils/Authentication";
import { IObeliskSpatialQueryCodeAndResults } from "./ObeliskQueryInterfaces";
import { AirQualityServerConfig } from "../AirQualityServerConfig";

const fetch = require('node-fetch');
const querystring = require('querystring');

export class ObeliskQuerySpatial {
    static readonly address: string = AirQualityServerConfig.ObeliskAddress;
    constructor(private scopeId: string, private auth: ObeliskClientAuthentication, private log: Boolean = true) { }

    public async GetRawEventsFromTo(metricId: string, geoHash: string, fromTime_ms: number, toTime_ms: number): Promise<IObeliskSpatialQueryCodeAndResults> {
        let resultsStatus: number;
        let results: any;
        let url = ObeliskQuerySpatial.address
            + '/api/v1/scopes/'+ this.scopeId
            + '/locations/' + geoHash
            + '/' + metricId + '/events'
            + '?' + querystring.stringify({ from: fromTime_ms.toString(), to: toTime_ms.toString() });
        await fetch(url, { headers: this.auth.resourceCallAuthorizationHeader() })
            .then(res => {
                resultsStatus = res.status;
                return res;
            })
            .then(res => res.json())
            .then(jsonData => results = jsonData)
            .catch(
                err => {
                    results = err;
                    if (this.log) {
                        console.error(err);
                    }
                }
            );
        return { responseCode: resultsStatus,results:results }
        //return [resultsStatus, results];
    }
    public async GetRawEventsDateFromTo(metricId: string, geoHash: string, date: string, fromTime_ms?: number, toTime_ms?: number): Promise<IObeliskSpatialQueryCodeAndResults> {
        let resultsStatus: number;
        let results: any;
        let url = ObeliskQuerySpatial.address
            + '/api/v1/scopes/' + this.scopeId
            + '/locations/' + geoHash
            + '/' + metricId + '/events'
            + '/' + date;
        if ((fromTime_ms !== undefined) && (toTime_ms !== undefined)) {
            url += '?' + querystring.stringify({ from: fromTime_ms.toString(), to: toTime_ms.toString() });
        }
        await fetch(url, { headers: this.auth.resourceCallAuthorizationHeader() })
            .then(res => {
                resultsStatus = res.status;
                return res;
            })
            .then(res => res.json())
            .then(jsonData => results = jsonData)
            .catch(
                err => {
                    results = err;
                    if (this.log) {
                        console.error(err);
                    }
                }
            );
        return { responseCode: resultsStatus, results: results };
    }
}