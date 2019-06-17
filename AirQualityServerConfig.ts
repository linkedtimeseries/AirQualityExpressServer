
export abstract class AirQualityServerConfig {
    static readonly scopeId: string = 'cot.airquality';
    static readonly ObeliskClientId: string = 'smart-flanders-linked-air-quality';
    static readonly ObeliskClientSecret: string = '87bf0a72-bbdf-4aa6-962f-12ae1bf82d80';
    static readonly geoHashColumnName: string = 'geohash';
    static readonly ObeliskAddress: string = 'https://obelisk.ilabt.imec.be';
    static readonly Obelisk_url_post_authenticate: string = 'https://obelisk.ilabt.imec.be/auth/realms/idlab-iot/protocol/openid-connect/token';
    static readonly Obelisk_url_post_access: string = 'https://obelisk.ilabt.imec.be/auth/realms/idlab-iot/protocol/openid-connect/token';
    static readonly Obelisk_url_post_refreshRPT: string = 'https://obelisk.ilabt.imec.be/auth/realms/idlab-iot/protocol/openid-connect/token';
}
