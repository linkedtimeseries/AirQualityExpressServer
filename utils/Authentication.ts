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
    static readonly url_post_authenticate: string = 'https://obelisk.ilabt.imec.be/auth/realms/idlab-iot/protocol/openid-connect/token';
    static readonly url_post_access: string = 'https://obelisk.ilabt.imec.be/auth/realms/idlab-iot/protocol/openid-connect/token';
    static readonly url_post_refreshRPT: string = 'https://obelisk.ilabt.imec.be/auth/realms/idlab-iot/protocol/openid-connect/token';

    constructor(private client_id: string, private client_secret: string, private log: Boolean = true) {
    }

    public async initTokens() {
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

        //await new Promise(resolve => setTimeout(resolve, 3000));
        //await this.refreshRPT();
        //console.log('init - R-RPT');
        //console.log("R-RPT:" + this.RPTTokens.access_token);
        //console.log("R-RPT:" + this.RPTTokens.refresh_token);
    }
    private async authenticateToObelisk() {
        let authString = (new Buffer(this.client_id + ':' + this.client_secret)).toString('base64');
        let headersPost = {
            'Authorization': 'Basic ' + authString,
            'Content-type': 'application/x-www-form-urlencoded',            
        };
    
        await fetch(ObeliskClientAuthentication.url_post_authenticate, {
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
    private async getRPTTokens() {        
        let headersPost = {
            'Authorization': 'Bearer ' + this.authTokens.access_token,
            'Content-type': 'application/x-www-form-urlencoded',
        };
        await fetch(ObeliskClientAuthentication.url_post_access, {
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
    public async refreshRPT() {
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
        //console.log('refresh:' + expiresDate + ',' + new Date(expiresDate));
        await fetch(ObeliskClientAuthentication.url_post_refreshRPT, {
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
        //console.log(this.RPTTokens.access_token);
    }
    public showTokens(): Tokens {
        return this.RPTTokens;
    }
}