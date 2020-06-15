// Implementation of the Obelisk metadata query : /scopes/{scopeId}/metrics
// (https://obelisk.ilabt.imec.be/swagger/?urls.primaryName=Obelisk%20API%20v1)
// The result lists the metrics for the given scopeId

import AirQualityServerConfig from "../AirQualityServerConfig";
import ObeliskClientAuthentication from "../utils/Authentication";
import { IObeliskMetadataMetricsQueryCodeAndResults } from "./ObeliskQueryInterfaces";

import fetch = require("node-fetch");

export default class ObeliskQueryMetadata {
    private static readonly address: string = AirQualityServerConfig.obeliskAddress;
    constructor(private scopeId: string, private auth: ObeliskClientAuthentication, private log: boolean = true) { }

    public async getMetrics(): Promise<IObeliskMetadataMetricsQueryCodeAndResults> {
        let resultsStatus: number;
        let results: any;
        const url = ObeliskQueryMetadata.address + "/api/v2/scopes/" + this.scopeId + "/metrics";
        await fetch(url, { headers: this.auth.resourceCallAuthorizationHeader() })
            .then((res) => {
                resultsStatus = res.status;
                if (this.log) {
                    // console.log(res.ok);
                    console.log(res.status);
                    console.log(res.statusText);
                    // console.log(res.headers.raw());
                    // console.log(res.headers.get('content-type'));
                }
                if (!res.ok) { throw new Error(res.status + "," + res.statusText); }
                return res;
            })
            .then((res) => res.json())
            .then((jsonData) => results = jsonData)
            .catch(
                (err) => {
                    results = err;
                    if (this.log) {
                        console.error(err);
                    }
                    throw err;
                },
            );
        return { responseCode: resultsStatus, results };
    }
}
