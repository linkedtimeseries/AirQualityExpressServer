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
class ObeliskQueryMetadata {
    constructor(scopeId, auth, log = true) {
        this.scopeId = scopeId;
        this.auth = auth;
        this.log = log;
    }
    GetMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            let resultsStatus;
            let results;
            let url = ObeliskQueryMetadata.address + '/api/v1/scopes/' + this.scopeId + '/metrics';
            yield fetch(url, { headers: this.auth.resourceCallAuthorizationHeader() })
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
    GetThings() {
        return __awaiter(this, void 0, void 0, function* () {
            let resultsStatus;
            let results;
            let url = ObeliskQueryMetadata.address + '/api/v1/scopes/' + this.scopeId + '/things';
            yield fetch(url, { headers: this.auth.resourceCallAuthorizationHeader() })
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
ObeliskQueryMetadata.address = 'https://obelisk.ilabt.imec.be';
exports.ObeliskQueryMetadata = ObeliskQueryMetadata;
//# sourceMappingURL=OQMetadata.js.map