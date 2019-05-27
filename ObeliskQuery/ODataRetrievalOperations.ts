import { ObeliskClientAuthentication } from "../utils/Authentication";
import { ObeliskSpatialQueryCodeAndResults } from "./ObeliskQueryInterfaces";

const fetch = require('node-fetch');
const querystring = require('querystring');

export class ObeliskDataRetrievalOperations {
    static readonly address: string = 'https://obelisk.ilabt.imec.be';
    constructor(private scopeId: string, private auth: ObeliskClientAuthentication, private log: Boolean = true) { }

    public async GetEvents(metricId: string, geoHash: string[], fromTime_ms?: number, toTime_ms?: number,limit?:number): Promise<ObeliskSpatialQueryCodeAndResults> {
        let resultsStatus: number;
        let results: any;
        let url = ObeliskDataRetrievalOperations.address
            + '/api/v1/scopes/' + this.scopeId
            + '/query/' + metricId + '/events'
            + '?'         
            + 'area=' + geoHash.join(",")
            + '&spatialIndex=geohash';
        if (fromTime_ms && toTime_ms)
            url += '&'+querystring.stringify({ from: fromTime_ms.toString(), to: toTime_ms.toString() });
        if (limit)
            url += '&limit=' + limit.toString();
        await fetch(url, { headers: this.auth.resourceCallAuthorizationHeader() })
            //.then(res => {
            //    console.log(res.ok);
            //    console.log(res.status);
            //    console.log(res.statusText);
            //    console.log(res.headers.raw());
            //    console.log(res.headers.get('content-type'));
            //    return res;
            //});
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
        return { responseCode: resultsStatus, results: results }       
    }
    public async GetEventsLatest(metricId: string, geoHash: string[]): Promise<ObeliskSpatialQueryCodeAndResults> {
        let resultsStatus: number;
        let results: any;
        let url = ObeliskDataRetrievalOperations.address
            + '/api/v1/scopes/' + this.scopeId
            + '/query/' + metricId + '/events/latest'
            + '?'
            //+ querystring.stringify({ from: fromTime_ms.toString(), to: toTime_ms.toString() })
            + 'area=' + geoHash.join(",")
            + '&spatialIndex=geohash';       
        await fetch(url, { headers: this.auth.resourceCallAuthorizationHeader() })
            //.then(res => {
            //    console.log(res.ok);
            //    console.log(res.status);
            //    console.log(res.statusText);
            //    console.log(res.headers.raw());
            //    console.log(res.headers.get('content-type'));
            //    return res;
            //});
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
        return { responseCode: resultsStatus, results: results }
    }

    //bad request if area is filled in -- to check ??
    //public async GetStats(metricId: string, geoHash: string[]) /*: Promise<ObeliskSpatialQueryCodeAndResults>*/ {
    //    let resultsStatus: number;
    //    let results: any;
    //    let url = ObeliskDataRetrievalOperations.address
    //        + '/api/v1/scopes/' + this.scopeId
    //        + '/query/' + metricId + '/stats'
    //        + '?'
    //        //+ querystring.stringify({ from: fromTime_ms.toString(), to: toTime_ms.toString() })
    //        + 'area=' + geoHash.join(",")
    //        + '&spatialIndex=geohash';
    //    await fetch(url, { headers: this.auth.resourceCallAuthorizationHeader() })
    //        .then(res => {
    //            console.log(res.ok);
    //            console.log(res.status);
    //            console.log(res.statusText);
    //            console.log(res.headers.raw());
    //            console.log(res.headers.get('content-type'));
    //            return res;
    //        });
    //        //.then(res => Promise.all([res.status, res.json()]))
    //        //.then(([status, jsonData]) => {
    //        //    if (this.log) {
    //        //        console.log(jsonData);
    //        //        console.log(status);
    //        //    }
    //        //    resultsStatus = status;
    //        //    results = jsonData;
    //        //})
    //        //.catch(err => console.error(err));
    //    return { responseCode: resultsStatus, results: results }
    //}
}