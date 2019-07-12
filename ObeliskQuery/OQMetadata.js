"use strict";
//Implementation of the Obelisk metadata query : /scopes/{scopeId}/metrics 
//(https://obelisk.ilabt.imec.be/swagger/?urls.primaryName=Obelisk%20API%20v1)
//The result lists the metrics for the given scopeId
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
class ObeliskQueryMetadata {
    constructor(scopeId, auth, log = true) {
        this.scopeId = scopeId;
        this.auth = auth;
        this.log = log;
    }
    getMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            let resultsStatus;
            let results;
            let url = ObeliskQueryMetadata.address + '/api/v1/scopes/' + this.scopeId + '/metrics';
            yield fetch(url, { headers: this.auth.resourceCallAuthorizationHeader() })
                .then(res => {
                resultsStatus = res.status;
                if (this.log) {
                    //console.log(res.ok);
                    console.log(res.status);
                    console.log(res.statusText);
                    //console.log(res.headers.raw());
                    //console.log(res.headers.get('content-type'));
                }
                if (!res.ok) {
                    throw new Error(res.status + "," + res.statusText);
                }
                return res;
            })
                .then(res => res.json())
                .then(jsonData => results = jsonData)
                .catch(err => {
                results = err;
                if (this.log) {
                    console.error(err);
                }
                throw err;
            });
            return { responseCode: resultsStatus, results: results };
        });
    }
}
ObeliskQueryMetadata.address = AirQualityServerConfig_1.AirQualityServerConfig.ObeliskAddress;
exports.ObeliskQueryMetadata = ObeliskQueryMetadata;
//# sourceMappingURL=OQMetadata.js.map