import { ObeliskClientAuthentication } from "../utils/Authentication";
import { IObeliskMetadataMetricsQueryCodeAndResults, IObeliskMetadataThingsQueryCodeAndResults } from "./ObeliskQueryInterfaces";
import { AirQualityServerConfig } from "../AirQualityServerConfig";

const fetch = require('node-fetch');

export class ObeliskQueryMetadata {
    static readonly address: string = AirQualityServerConfig.ObeliskAddress;
    constructor(private scopeId: string, private auth: ObeliskClientAuthentication, private log: Boolean=true) { }

    public async GetMetrics(): Promise<IObeliskMetadataMetricsQueryCodeAndResults> {
        let resultsStatus: number;
        let results: any;
        let url = ObeliskQueryMetadata.address + '/api/v1/scopes/' + this.scopeId + '/metrics';
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
                if (!res.ok) { throw new Error(res.status + "," + res.statusText); }
                return res;
            })
            .then(res => res.json())
            .then(jsonData=>results=jsonData)         
            .catch(
                err => {
                    results = err;     
                    if (this.log) {
                        console.error(err);
                    }
                    throw err;
                }
            );
        return { responseCode: resultsStatus, results: results };
    }   
}