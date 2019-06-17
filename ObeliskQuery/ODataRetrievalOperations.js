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
const AirQualityServerConfig_1 = require("../AirQualityServerConfig");
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
                //})
                .then(res => {
                resultsStatus = res.status;
                return res;
            })
                .then(res => res.json())
                .then(jsonData => results = jsonData)
                .catch(err => {
                results = err;
                if (this.log) {
                    console.error(err);
                }
            });
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
                .then(res => {
                resultsStatus = res.status;
                return res;
            })
                .then(res => res.json())
                .then(jsonData => results = jsonData)
                .catch(err => {
                results = err;
                if (this.log) {
                    console.error(err);
                }
            });
            return { responseCode: resultsStatus, results: results };
        });
    }
}
ObeliskDataRetrievalOperations.address = AirQualityServerConfig_1.AirQualityServerConfig.ObeliskAddress;
exports.ObeliskDataRetrievalOperations = ObeliskDataRetrievalOperations;
//# sourceMappingURL=ODataRetrievalOperations.js.map