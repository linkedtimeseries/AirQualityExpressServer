//implementation of the Obelisk authentication as described by https://obelisk.ilabt.imec.be/api/v1/docs/security/auth-details/
//url references can be found in class AirQualityServerConfig
//client_id and client_secret are read from file obeliskLogin.json, 
//format {
//    "ObeliskClientId": "xxx",
//    "ObeliskClientSecret": "yyy"
//}

import { AirQualityServerConfig } from "../AirQualityServerConfig";

const fetch = require('node-fetch');
const querystring = require('querystring');
const interval = require('interval-promise')

interface Tokens {
    access_token: string;
    refresh_token: string;
}

export class ObeliskClientAuthentication {    
    private authTokens: Tokens; 
    private RPTTokens: Tokens;
    private expires_in: number;
 
    constructor(private client_id: string, private client_secret: string, private log: Boolean = true) {
    }

    public async initTokens() : Promise<void> {
        await this.authenticateToObelisk();
        if (this.log) {
            console.log('init - auth');
            console.log("auth:" + this.authTokens.access_token);
        }
        await this.getRPTTokens();
        if (this.log) {
            console.log('init - RPT');
            console.log("RPT:" + this.RPTTokens.access_token);
            console.log("RPT:" + this.RPTTokens.refresh_token);
        }
        //silent refresh
        console.log('set interval:' + this.expires_in);
        interval(async () => this.refreshRPT(), this.expires_in*900); //convert to miliseconds + take margin (10%)
    }
    private async authenticateToObelisk() : Promise<void> {
        let authString = (new Buffer(this.client_id + ':' + this.client_secret)).toString('base64');
        let headersPost = {
            'Authorization': 'Basic ' + authString,
            'Content-type': 'application/x-www-form-urlencoded',            
        };

        await fetch(AirQualityServerConfig.Obelisk_url_post_authenticate, {
            method: 'POST',
            headers: headersPost,
            body: querystring.stringify({ grant_type: 'client_credentials' })})          
            .then(res=> res.json())
            .then(json => {
                this.authTokens = {
                    access_token: json.access_token,
                    refresh_token: json.refresh_token
                }
            })
            .catch(err => console.error(err));
    }
    private async getRPTTokens() : Promise<void> {        
        let headersPost = {
            'Authorization': 'Bearer ' + this.authTokens.access_token,
            'Content-type': 'application/x-www-form-urlencoded',
        };
        await fetch(AirQualityServerConfig.Obelisk_url_post_access, {
            method: 'POST',
            headers: headersPost,
            body: querystring.stringify({ grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket', audience: 'policy-enforcer' })})
            .then(res => res.json())
            .then(json => {               
                this.RPTTokens = {
                    access_token: json.access_token,
                    refresh_token: json.refresh_token
                };
                this.expires_in = json.expires_in;
            })
            .catch(err => console.error(err));    
    }
    public resourceCallAuthorizationHeader() {
        let header = { 'authorization': 'Bearer ' + this.RPTTokens.access_token };
        return header;
    }
    public async refreshRPT():Promise<void> {
        let headersPost = {           
            'Content-type': 'application/x-www-form-urlencoded',
        };
        let params = {
            grant_type: 'refresh_token',
            refresh_token: this.RPTTokens.refresh_token,
            client_id: this.client_id,
            client_secret: this.client_secret
        }
        let expiresDate = Date.now();
        await fetch(AirQualityServerConfig.Obelisk_url_post_refreshRPT, {
            method: 'POST',
            headers: headersPost,
            body: querystring.stringify(params)})
            .then(res => res.json())
            .then(json => {
                this.RPTTokens = {
                    access_token: json.access_token,
                    refresh_token: json.refresh_token
                }                
                this.expires_in = json.expires_in; //unit = seconds                
            })
            .catch(err => console.error(err));
    }
    public showTokens(): Tokens {
        return this.RPTTokens;
    }
}