// Implementation of the Obelisk data retrieval operation /api/v1/scopes/{scopeId}/query/{metricId}/events
// (https://obelisk.ilabt.imec.be/swagger/?urls.primaryName=Obelisk%20API%20v1)
// The result gives the raw events for the specific metric

import AirQualityServerConfig from "../AirQualityServerConfig";
import ObeliskClientAuthentication from "../utils/Authentication";
import { IObeliskSpatialQueryCodeAndResults } from "./ObeliskQueryInterfaces";

import fetch = require("node-fetch");
import querystring = require("querystring");

export default class ObeliskDataRetrievalOperations {
    private static readonly address: string = AirQualityServerConfig.obeliskAddress;
    constructor(private scopeId: string, private auth: ObeliskClientAuthentication, private log: boolean = true) { }

    public buildGeoHashUrl(metricId: string, geoHash: string[]): string {
        return ObeliskDataRetrievalOperations.address
            + "/api/v1/scopes/" + this.scopeId
            + "/query/" + metricId + "/events"
            + "?"
            + "area=" + geoHash.join(",")
            + "&spatialIndex=geohash";
    }

    public buildGeoRelUrl(metricId: string, polygon: string): string {
        return ObeliskDataRetrievalOperations.address
            + "/api/v1/scopes/" + this.scopeId
            + "/query/" + metricId + "/events"
            + "?"
            + "georel=coveredBy&geometry=polygon"
            + "&coords=" + polygon;
    }

    public async getEvents(
        metricId: string,
        geoHash: string[],
        url: string,
        fromTimeMs?: number,
        toTimeMs?: number,
        limit?: number,
    ): Promise<IObeliskSpatialQueryCodeAndResults> {
        let resultsStatus: number;
        let results: any;

        if (fromTimeMs && toTimeMs) {
            url += "&" + querystring.stringify({ from: fromTimeMs.toString(), to: toTimeMs.toString() });
        }

        if (limit) {
            url += "&limit=" + limit.toString();
        }

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
