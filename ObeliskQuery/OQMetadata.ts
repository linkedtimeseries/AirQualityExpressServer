import { ObeliskClientAuthentication } from "../utils/Authentication";

const fetch = require('node-fetch');

export class ObeliskQueryMetadata {
    static readonly address: string = 'https://obelisk.ilabt.imec.be';
    constructor(private scopeId: string, private auth: ObeliskClientAuthentication, private log: Boolean=true) { }

    public async GetMetrics() {
        let resultsStatus: number;
        let results: any;
        let url = ObeliskQueryMetadata.address + '/api/v1/scopes/' + this.scopeId + '/metrics';
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
    public async GetThings() {
        let resultsStatus: number;
        let results: any;
        let url = ObeliskQueryMetadata.address + '/api/v1/scopes/' + this.scopeId + '/things';
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