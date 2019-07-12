//Implementation of the Obelisk data retrieval operation /api/v1/scopes/{scopeId}/query/{metricId}/events
//(https://obelisk.ilabt.imec.be/swagger/?urls.primaryName=Obelisk%20API%20v1)
//The result gives the raw events for the specific metric

import { ObeliskClientAuthentication } from "../utils/Authentication";
import { IObeliskSpatialQueryCodeAndResults } from "./ObeliskQueryInterfaces";
import { AirQualityServerConfig } from "../AirQualityServerConfig";

const fetch = require('node-fetch');
const querystring = require('querystring');

export class ObeliskDataRetrievalOperations {
    static readonly address: string = AirQualityServerConfig.ObeliskAddress;
    constructor(private scopeId: string, private auth: ObeliskClientAuthentication, private log: Boolean = true) { }

    public async getEvents(metricId: string, geoHash: string[], fromTime_ms?: number, toTime_ms?: number,limit?:number): Promise<IObeliskSpatialQueryCodeAndResults> {
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
            .then(res => {
                resultsStatus = res.status;
                if (this.log) {
                    //console.log(res.ok);
                    console.log(res.status);
                    console.log(res.statusText);
                    //console.log(res.headers.raw());
                    //console.log(res.headers.get('content-type'));
                }
                if (!res.ok) { throw new Error(res.status + "," + res.statusText);}
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
                    throw err;
                }
            );           
        return { responseCode: resultsStatus, results: results }       
    }   
}