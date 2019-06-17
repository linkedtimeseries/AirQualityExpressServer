import { ObeliskClientAuthentication } from "../utils/Authentication";
import { IObeliskMetadataMetricsQueryCodeAndResults, IObeliskMetadataThingsQueryCodeAndResults } from "./ObeliskQueryInterfaces";

const fetch = require('node-fetch');

export class ObeliskQueryMetadata {
    static readonly address: string = 'https://obelisk.ilabt.imec.be';
    constructor(private scopeId: string, private auth: ObeliskClientAuthentication, private log: Boolean=true) { }

    public async GetMetrics(): Promise<IObeliskMetadataMetricsQueryCodeAndResults> {
        let resultsStatus: number;
        let results: any;
        let url = ObeliskQueryMetadata.address + '/api/v1/scopes/' + this.scopeId + '/metrics';
        await fetch(url, { headers: this.auth.resourceCallAuthorizationHeader() })
            .then(res => {
                resultsStatus = res.status;                
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
                }
            );
        return { responseCode: resultsStatus, results: results };
    }
    public async GetThings(): Promise<IObeliskMetadataThingsQueryCodeAndResults> {
        let resultsStatus: number;
        let results: any;
        let url = ObeliskQueryMetadata.address + '/api/v1/scopes/' + this.scopeId + '/things';
        await fetch(url, { headers: this.auth.resourceCallAuthorizationHeader() })
            //.then(res => Promise.all([res.status, res.json()]))
            //.then(([status, jsonData]) => {
            //    if (this.log) {
            //        console.log(jsonData);
            //        console.log(status);
            //    }
            //    resultsStatus = status;
            //    results = jsonData;
            //})
            //.catch(err => console.error(err));
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