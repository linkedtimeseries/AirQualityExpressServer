// abstract class that contains configuration information for building the JSONLD output.

export default abstract class JSONLDConfig {
    public static readonly context = {
        sosa: "http://www.w3.org/ns/sosa/",
        observes: {
            "@id": "http://www.w3.org/ns/sosa/observes",
            "@type": "@id",
        },
        hasSimpleResult: {
            "@id": "http://www.w3.org/ns/sosa/hasSimpleResult",
            "@type": "@id",
        },
        hasFeatureOfInterest: {
            "@id": "http://www.w3.org/ns/sosa/hasFeatureOfInterest",
            "@type": "@id",
        },
        observedProperty: {
            "@id": "http://www.w3.org/ns/sosa/observedProperty",
            "@type": "@id",
        },
        phenomenonTime: {
            "@id": "http://www.w3.org/ns/sosa/phenomenonTime",
            "@type": "https://www.w3.org/TR/owl-time/#time:Interval",
        },
        usedProcedure: {
            "@id": "http://www.w3.org/ns/sosa/usedProcedure",
            "@type": "@id",
        },
        madeBySensor: {
            "@id": "http://www.w3.org/ns/sosa/madeBySensor",
            "@type": "@id",
        },
        resultTime: {
            "@id": "http://www.w3.org/ns/sosa/resultTime",
            "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
        },
        output: {
            "@id": "http://www.w3.org/ns/ssn/Output",
            "@type": "@id",
        },
        label: {
            "@id": "http://www.w3.org/2000/01/rdf-schema#label",
        },
        lat: {
            "@id": "http://www.w3.org/2003/01/geo/wgs84_pos#lat",
        },
        long: {
            "@id": "http://www.w3.org/2003/01/geo/wgs84_pos#long",
        },
        endDate: {
            "@id": "http://schema.org/endDate",
            "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
        },
        startDate: {
            "@id": "http://schema.org/startDate",
            "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
        },
        next: {
            "@id": "http://www.wr.org/ns/hydra/core#next",
            "@type": "@id",
        },
        previous: {
            "@id": "http://www.wr.org/ns/hydra/core#previous",
            "@type": "@id",
        },
        tiles: "https://w3id.org/tree/terms#",
        dcterms: "http://purl.org/dc/terms/",
        hydra: "http://www.wr.org/ns/hydra/core#",
        time: "https://www.w3.org/TR/owl-time/",
        hasBeginning: {
            "@id" : "https://www.w3.org/TR/owl-time/#time:hasBeginning",
            "@type" : "https://www.w3.org/TR/owl-time/#time:Instant",
        },
        inXSDDateTimeStamp: {
            "@id" : "https://www.w3.org/TR/owl-time/#time:inXSDDateTimeStamp",
            "@type" : "@id",
        },
        hasEnd: {
            "@id" : "https://www.w3.org/TR/owl-time/#time:hasEnd",
            "@type" : "https://www.w3.org/TR/owl-time/#time:Instant",
        },

    };
    public static readonly FeatureOfInterest: string = "AirQuality";
    public static readonly baseURL: string = "http://example.org/data/";
    public static readonly openObeliskAddress = "http://localhost:5000";
    // intervals to calculate averages
    public static readonly minuteInterval: number = 60000;
    public static readonly hourInterval: number = 3600000;
}
