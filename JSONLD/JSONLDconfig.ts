export abstract class JSONLDConfig {
    static readonly context: string = '"@context":{'
            +'"sosa":"http://wwww.w3.org/ns/sosa/"'
            +',"rdfs":"http://www.w3.org/2000/01/rdf-schema#"'
            +'}';
    static readonly FeatureOfInterest: string = "AirQuality";
    static readonly baseURL: string = "http://example.org/data/";
}