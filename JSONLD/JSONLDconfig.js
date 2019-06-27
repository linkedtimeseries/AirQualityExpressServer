"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JSONLDConfig {
}
JSONLDConfig.context = '"@context":{'
    + '"sosa":"http://wwww.w3.org/ns/sosa/"'
    + ',"sosa:observes":{"@type":"@id"}'
    + ',"sosa:hasFeatureOfInterest":{"@type":"@id"}'
    + ',"sosa:madeBySensor":{"@type":"@id"}'
    + ',"sosa:observedProperty":{"@type":"@id"}'
    + ',"rdfs":"http://www.w3.org/2000/01/rdf-schema#"'
    + ',"geo":"http://www.w3.org/2003/01/geo/wgs84_pos#"'
    + '}';
JSONLDConfig.FeatureOfInterest = "AirQuality";
JSONLDConfig.baseURL = "http://example.org/data/";
exports.JSONLDConfig = JSONLDConfig;
//# sourceMappingURL=JSONLDconfig.js.map