const fs = require('fs');

export class AirQualityServerConfig {
    static readonly scopeId: string = 'cot.airquality';
    readonly ObeliskClientId: string ;
    readonly ObeliskClientSecret: string;
    static readonly dateTimeFrame: number = 86400000;//window is 1 day in msec
    static readonly geoHashColumnName: string = 'geohash';
    static readonly sourceIdColumnName: string = 'sourceId';
    static readonly timeColumnName: string = 'time';
    static readonly valueColumnName: string = 'value';
    static readonly ObeliskAddress: string = 'https://obelisk.ilabt.imec.be';
    static readonly Obelisk_url_post_authenticate: string = 'https://obelisk.ilabt.imec.be/auth/realms/idlab-iot/protocol/openid-connect/token';
    static readonly Obelisk_url_post_access: string = 'https://obelisk.ilabt.imec.be/auth/realms/idlab-iot/protocol/openid-connect/token';
    static readonly Obelisk_url_post_refreshRPT: string = 'https://obelisk.ilabt.imec.be/auth/realms/idlab-iot/protocol/openid-connect/token';
    constructor() {
        let rawdata = fs.readFileSync('obeliskLogin.json','utf8');
        let config = JSON.parse(rawdata.trim()); 
        this.ObeliskClientId = config.ObeliskClientId;
        this.ObeliskClientSecret = config.ObeliskClientSecret;
    }
}
