// abstract class that contains configuration information for building the JSONLD output.

export default abstract class JSONLDConfig {
    public static readonly context: string = '"@context":{'
        + '"sosa":"http://wwww.w3.org/ns/sosa/"'
        + ',"sosa:observes":{"@type":"@id"}'
        + ',"sosa:hasFeatureOfInterest":{"@type":"@id"}'
        + ',"sosa:madeBySensor":{"@type":"@id"}'
        + ',"sosa:observedProperty":{"@type":"@id"}'
        + ',"rdfs":"http://www.w3.org/2000/01/rdf-schema#"'
        + ',"geo":"http://www.w3.org/2003/01/geo/wgs84_pos#"'
        + ',"tiles":"https://w3id.org/tree/terms#"'
        + ',"ssn":"http://www.w3.org/ns/ssn/"'
        + ',"dcterms":"http://purl.org/dc/terms/"'
        + ',"hydra":"http://wwww.wr.org/ns/hydra/core#"'
        + ',"ts":"http://xxx/"'
        + "}";
    public static readonly FeatureOfInterest: string = "AirQuality";
    public static readonly baseURL: string = "http://example.org/data/";
    public static readonly openobeliskAddress = "https://openobelisk.ilabt.imec/be/";
}
