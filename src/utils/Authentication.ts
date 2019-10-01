// implementation of the Obelisk authentication as described by
//  https://obelisk.ilabt.imec.be/api/v1/docs/security/auth-details/
// url references can be found in class AirQualityServerConfig
// client_id and client_secret are read from file obeliskLogin.json,
// format {
//    "ObeliskClientId": "xxx",
//    "ObeliskClientSecret": "yyy"
// }

import AirQualityServerConfig from "../AirQualityServerConfig";

import interval from "interval-promise";
import fetch = require("node-fetch");
import querystring = require("querystring");

interface ITokens {
    access_token: string;
    refresh_token: string;
}

export default class ObeliskClientAuthentication {
    private authTokens: ITokens;
    private RPTTokens: ITokens;
    private expiresIn: number;

    constructor(private clientId: string, private clientSecret: string, private log: boolean = true) {
        this.expiresIn = 10; // 10 seconds
    }

    public async initTokens(): Promise<void> {
        await this.authenticateToObelisk();
        if (this.log) {
            console.log("init - auth");
            console.log("auth:" + this.authTokens.access_token);
        }

        await this.getRPTTokens();
        if (this.log) {
            console.log("init - RPT");
            console.log("RPT:" + this.RPTTokens.access_token);
            console.log("RPT:" + this.RPTTokens.refresh_token);
        }

        // silent refresh
        console.log("set interval:" + this.expiresIn);
        interval(async () => this.refreshRPT(), this.expiresIn * 900); // convert to miliseconds + take margin (10%)
    }

    public resourceCallAuthorizationHeader() {
        const header = {
            authorization: "Bearer " + this.RPTTokens.access_token,
        };
        return header;
    }

    public async refreshRPT(): Promise<void> {
        const headersPost = {
            "Content-type": "application/x-www-form-urlencoded",
        };
        const params = {
            grant_type: "refresh_token",
            refresh_token: this.RPTTokens.refresh_token,
            client_id: this.clientId,
            client_secret: this.clientSecret,
        };
        const expiresDate = Date.now();
        await fetch(AirQualityServerConfig.obeliskUrlPostRefreshRPT, {
            method: "POST",
            headers: headersPost,
            body: querystring.stringify(params),
        })
            .then((res) => res.json())
            .then((json) => {
                this.RPTTokens = {
                    access_token: json.access_token,
                    refresh_token: json.refresh_token,
                };
                this.expiresIn = json.expires_in; // unit = seconds
            })
            .catch((err) => console.error(err));
    }

    public showTokens(): ITokens {
        return this.RPTTokens;
    }

    private async authenticateToObelisk(): Promise<void> {
        const authString = (new Buffer(this.clientId + ":" + this.clientSecret)).toString("base64");
        const headersPost = {
            "Authorization": "Basic " + authString,
            "Content-type": "application/x-www-form-urlencoded",
        };

        await fetch(AirQualityServerConfig.obeliskUrlPostAuthenticate, {
            method: "POST",
            headers: headersPost,
            body: querystring.stringify({ grant_type: "client_credentials" }),
        })
            .then((res) => res.json())
            .then((json) => {
                this.authTokens = {
                    access_token: json.access_token,
                    refresh_token: json.refresh_token,
                };
            })
            .catch((err) => console.error(err));
    }

    private async getRPTTokens(): Promise<void> {
        const headersPost = {
            "Authorization": "Bearer " + this.authTokens.access_token,
            "Content-type": "application/x-www-form-urlencoded",
        };

        await fetch(AirQualityServerConfig.obeliskUrlPostAccess, {
            method: "POST",
            headers: headersPost,
            body: querystring.stringify({
                grant_type: "urn:ietf:params:oauth:grant-type:uma-ticket",
                audience: "policy-enforcer",
            }),
        })
            .then((res) => res.json())
            .then((json) => {
                this.RPTTokens = {
                    access_token: json.access_token,
                    refresh_token: json.refresh_token,
                };
                this.expiresIn = json.expires_in;
            })
            .catch((err) => console.error(err));
    }
}
