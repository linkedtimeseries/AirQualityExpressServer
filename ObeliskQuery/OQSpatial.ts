import { ObeliskClientAuthentication } from "../utils/Authentication";

const fetch = require('node-fetch');
const querystring = require('querystring');

export class ObeliskQuerySpatial {
    static readonly address: string = 'https://obelisk.ilabt.imec.be';
    constructor(private scopeId: string, private auth: ObeliskClientAuthentication, private log: Boolean = true) { }

    public async GetRawEventsFromTo(metricId: string, geoHash: string, fromTime_ms: number, toTime_ms: number) {
        let resultsStatus: number;
        let results: any;
        let url = ObeliskQuerySpatial.address
            + '/api/v1/scopes/'+ this.scopeId
            + '/locations/' + geoHash
            + '/' + metricId + '/events'
            + '?' + querystring.stringify({ from: fromTime_ms.toString(), to: toTime_ms.toString() });
        await fetch(url, { headers: this.auth.resourceCallAuthorizationHeader() })
            //.then(res => {
            //    console.log(res.ok);
            //    console.log(res.status);
            //    console.log(res.statusText);
            //    console.log(res.headers.raw());
            //    console.log(res.headers.get('content-type'));
            //    return res;
            //})
            //.then(res => res.json())
            //.then(json => console.log(json))
            //.catch(err => console.error(err));
            .then(res => Promise.all([res.status, res.json()]))
            .then(([status, jsonData]) => {
                if (this.log) {
                    console.log(jsonData);
                    console.log(status);
                }
                resultsStatus = status;
                results = jsonData;
            })
            .catch(err => console.error(err));
        return [resultsStatus, results];
    }
    public async GetRawEventsDateFromTo(metricId: string, geoHash: string,date:string, fromTime_ms?: number, toTime_ms?: number) {
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
            .then(res => Promise.all([res.status, res.json()]))
            .then(([status, jsonData]) => {
                if (this.log) {
                    console.log(jsonData);
                    console.log(status);
                }
                resultsStatus = status;
                results = jsonData;
            })
            .catch(err => console.error(err));
        return [resultsStatus, results];
    }
}