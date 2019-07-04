"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
class AirQualityServerConfig {
    constructor() {
        let rawdata = fs.readFileSync('obeliskLogin.json', 'utf8');
        let config = JSON.parse(rawdata.trim());
        this.ObeliskClientId = config.ObeliskClientId;
        this.ObeliskClientSecret = config.ObeliskClientSecret;
    }
}
AirQualityServerConfig.scopeId = 'cot.airquality';
AirQualityServerConfig.dateTimeFrame = 86400000; //window is 1 day
AirQualityServerConfig.geoHashColumnName = 'geohash';
AirQualityServerConfig.sourceIdColumnName = 'sourceId';
AirQualityServerConfig.timeColumnName = 'time';
AirQualityServerConfig.valueColumnName = 'value';
AirQualityServerConfig.ObeliskAddress = 'https://obelisk.ilabt.imec.be';
AirQualityServerConfig.Obelisk_url_post_authenticate = 'https://obelisk.ilabt.imec.be/auth/realms/idlab-iot/protocol/openid-connect/token';
AirQualityServerConfig.Obelisk_url_post_access = 'https://obelisk.ilabt.imec.be/auth/realms/idlab-iot/protocol/openid-connect/token';
AirQualityServerConfig.Obelisk_url_post_refreshRPT = 'https://obelisk.ilabt.imec.be/auth/realms/idlab-iot/protocol/openid-connect/token';
exports.AirQualityServerConfig = AirQualityServerConfig;
//# sourceMappingURL=AirQualityServerConfig.js.map