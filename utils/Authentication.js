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
const interval = require('interval-promise');
class ObeliskClientAuthentication {
    constructor(client_id, client_secret, log = true) {
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.log = log;
    }
    initTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.authenticateToObelisk();
            if (this.log) {
                console.log('init - auth');
                console.log("auth:" + this.authTokens.access_token);
            }
            yield this.getRPTTokens();
            if (this.log) {
                console.log('init - RPT');
                console.log("RPT:" + this.RPTTokens.access_token);
                console.log("RPT:" + this.RPTTokens.refresh_token);
            }
            //silent refresh
            console.log('set interval:' + this.expires_in);
            interval(() => __awaiter(this, void 0, void 0, function* () { return this.refreshRPT(); }), this.expires_in * 900); //convert to miliseconds + take margin (10%)
        });
    }
    authenticateToObelisk() {
        return __awaiter(this, void 0, void 0, function* () {
            let authString = (new Buffer(this.client_id + ':' + this.client_secret)).toString('base64');
            let headersPost = {
                'Authorization': 'Basic ' + authString,
                'Content-type': 'application/x-www-form-urlencoded',
            };
            yield fetch(AirQualityServerConfig_1.AirQualityServerConfig.Obelisk_url_post_authenticate, {
                method: 'POST',
                headers: headersPost,
                body: querystring.stringify({ grant_type: 'client_credentials' })
            })
                .then(res => res.json())
                .then(json => {
                this.authTokens = {
                    access_token: json.access_token,
                    refresh_token: json.refresh_token
                };
            })
                .catch(err => console.error(err));
        });
    }
    getRPTTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            let headersPost = {
                'Authorization': 'Bearer ' + this.authTokens.access_token,
                'Content-type': 'application/x-www-form-urlencoded',
            };
            yield fetch(AirQualityServerConfig_1.AirQualityServerConfig.Obelisk_url_post_access, {
                method: 'POST',
                headers: headersPost,
                body: querystring.stringify({ grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket', audience: 'policy-enforcer' })
            })
                .then(res => res.json())
                .then(json => {
                this.RPTTokens = {
                    access_token: json.access_token,
                    refresh_token: json.refresh_token
                };
                this.expires_in = json.expires_in;
            })
                .catch(err => console.error(err));
        });
    }
    resourceCallAuthorizationHeader() {
        let header = { 'authorization': 'Bearer ' + this.RPTTokens.access_token };
        return header;
    }
    refreshRPT() {
        return __awaiter(this, void 0, void 0, function* () {
            let headersPost = {
                'Content-type': 'application/x-www-form-urlencoded',
            };
            let params = {
                grant_type: 'refresh_token',
                refresh_token: this.RPTTokens.refresh_token,
                client_id: this.client_id,
                client_secret: this.client_secret
            };
            let expiresDate = Date.now();
            yield fetch(AirQualityServerConfig_1.AirQualityServerConfig.Obelisk_url_post_refreshRPT, {
                method: 'POST',
                headers: headersPost,
                body: querystring.stringify(params)
            })
                .then(res => res.json())
                .then(json => {
                this.RPTTokens = {
                    access_token: json.access_token,
                    refresh_token: json.refresh_token
                };
                this.expires_in = json.expires_in; //unit = seconds                
            })
                .catch(err => console.error(err));
        });
    }
    showTokens() {
        return this.RPTTokens;
    }
}
exports.ObeliskClientAuthentication = ObeliskClientAuthentication;
//# sourceMappingURL=Authentication.js.map