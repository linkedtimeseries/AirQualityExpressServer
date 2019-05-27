"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fetch = require('node-fetch');
const querystring = require('querystring');
class ObeliskDataRetrievalOperations {
    constructor(scopeId, auth, log = true) {
        this.scopeId = scopeId;
        this.auth = auth;
        this.log = log;
    }
    GetEvents(metricId, geoHash, fromTime_ms, toTime_ms, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            let resultsStatus;
            let results;
            let url = ObeliskDataRetrievalOperations.address
                + '/api/v1/scopes/' + this.scopeId
                + '/query/' + metricId + '/events'
                + '?'
                + 'area=' + geoHash.join(",")
                + '&spatialIndex=geohash';
            if (fromTime_ms && toTime_ms)
                url += '&' + querystring.stringify({ from: fromTime_ms.toString(), to: toTime_ms.toString() });
            if (limit)
                url += '&limit=' + limit.toString();
            yield fetch(url, { headers: this.auth.resourceCallAuthorizationHeader() })
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
            return { responseCode: resultsStatus, results: results };
        });
    }
    GetEventsLatest(metricId, geoHash) {
        return __awaiter(this, void 0, void 0, function* () {
            let resultsStatus;
            let results;
            let url = ObeliskDataRetrievalOperations.address
                + '/api/v1/scopes/' + this.scopeId
                + '/query/' + metricId + '/events/latest'
                + '?'
                //+ querystring.stringify({ from: fromTime_ms.toString(), to: toTime_ms.toString() })
                + 'area=' + geoHash.join(",")
                + '&spatialIndex=geohash';
            yield fetch(url, { headers: this.auth.resourceCallAuthorizationHeader() })
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
            return { responseCode: resultsStatus, results: results };
        });
    }
    GetStats(metricId, geoHash) {
        return __awaiter(this, void 0, void 0, function* () {
            let resultsStatus;
            let results;
            let url = ObeliskDataRetrievalOperations.address
                + '/api/v1/scopes/' + this.scopeId
                + '/query/' + metricId + '/stats'
                + '?'
                //+ querystring.stringify({ from: fromTime_ms.toString(), to: toTime_ms.toString() })
                + 'area=' + geoHash.join(",")
                + '&spatialIndex=geohash';
            yield fetch(url, { headers: this.auth.resourceCallAuthorizationHeader() })
                .then(res => {
                console.log(res.ok);
                console.log(res.status);
                console.log(res.statusText);
                console.log(res.headers.raw());
                console.log(res.headers.get('content-type'));
                return res;
            });
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
            return { responseCode: resultsStatus, results: results };
        });
    }
}
ObeliskDataRetrievalOperations.address = 'https://obelisk.ilabt.imec.be';
exports.ObeliskDataRetrievalOperations = ObeliskDataRetrievalOperations;
//# sourceMappingURL=ODataRetrievalOperations.js.map