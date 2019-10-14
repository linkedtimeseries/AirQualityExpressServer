import fs = require("fs");

export default class AirQualityServerConfig {
    public static readonly scopeId = "cot.airquality";
    public static readonly dateTimeFrame = 86400000; // window is 30 min in msec
    public static readonly geoHashColumnName = "geohash";
    public static readonly sourceIdColumnName = "sourceId";
    public static readonly timeColumnName = "time";
    public static readonly valueColumnName = "value";
    public static readonly obeliskAddress = "https://obelisk.ilabt.imec.be";
    public static readonly obeliskUrlPostAuthenticate =
        "https://obelisk.ilabt.imec.be/auth/realms/idlab-iot/protocol/openid-connect/token";
    public static readonly obeliskUrlPostAccess =
        "https://obelisk.ilabt.imec.be/auth/realms/idlab-iot/protocol/openid-connect/token";
    public static readonly obeliskUrlPostRefreshRPT =
        "https://obelisk.ilabt.imec.be/auth/realms/idlab-iot/protocol/openid-connect/token";
    public readonly obeliskClientId: string;
    public readonly obeliskClientSecret: string;
    public readonly dctermsLicense: string;
    public readonly dctermsRights: string;
    constructor() {
        const rawdata = fs.readFileSync("obeliskLogin.json", "utf8");
        const config = JSON.parse(rawdata.trim());
        this.obeliskClientId = config.ObeliskClientId;
        this.obeliskClientSecret = config.ObeliskClientSecret;
        this.dctermsLicense = config.dcterms_license;
        this.dctermsRights = config.dcterms_rights;
    }
}
