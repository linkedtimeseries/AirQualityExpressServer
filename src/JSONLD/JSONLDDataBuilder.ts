// Converts the query results to JSONLD format according to the sosa standard
//  (https://www.w3.org/TR/2017/REC-vocab-ssn-20171019/)
//  step 1 - add FeatureOfInterest
//  step 2 - add ObservableProperties
//  step 3 - add Sensors
//  step 4 - add Observations
// Embed results in @graph member

import geohash = require("ngeohash");
import AirQualityServerConfig from "../AirQualityServerConfig";
import IQueryResults from "../API/IQueryResults";
import JSONLDConfig from "./JSONLDConfig";

export default class JSONLDDataBuilder {

    public build(results: IQueryResults): object {
        const graph = [];
        graph.push(this.buildFeatureOfInterest());
        return graph.concat(
            this.buildObservableProperties(results),
            this.buildSensors(results),
            this.buildObservations(results),
        );
    }

    private buildFeatureOfInterest() {
        return {
            "@id": JSONLDConfig.baseURL + JSONLDConfig.FeatureOfInterest,
            "@type": "sosa:FeatureOfInterest",
            "rdfs:label": JSONLDConfig.FeatureOfInterest,
        };
    }

    private buildObservableProperty(metricId: string) {
        return {
            "@id": JSONLDConfig.baseURL + metricId,
            "@type": "sosa:ObervableProperty",
            "rdfs:label": "metricId." + metricId,
        };
    }

    private buildObservableProperties(results: IQueryResults) {
        return results.metricResults.map((mr) => {
            return this.buildObservableProperty(mr.metricId);
        });
    }

    private buildSensor(sensorId: string, metricIds: Set<string>) {
        const metrics = [];
        for (const metricId of metricIds) {
            metrics.push(JSONLDConfig.baseURL + metricId);
        }

        return {
            "@id": JSONLDConfig.baseURL + sensorId,
            "@type": "sosa:Sensor",
            "rdfs:label": "sourceId." + sensorId,
            "sosa:observes": metrics,
        };
    }

    private buildSensors(results: IQueryResults) {
        const colNr: number = results.columns.indexOf(AirQualityServerConfig.sourceIdColumnName);
        const sensorsMap = new Map<string, Set<string>>();
        for (const mr of results.metricResults) {
            for (const v of mr.values) {
                if (sensorsMap.has(v[colNr].toString())) {
                    sensorsMap.get(v[colNr].toString()).add(mr.metricId);
                } else {
                    sensorsMap.set(v[colNr].toString(), new Set<string>([mr.metricId]));
                }
            }
        }

        const s = [];
        for (const sensor of sensorsMap.keys()) {
            s.push(this.buildSensor(sensor, sensorsMap.get(sensor)));
        }
        return s;
    }

    private buildObservation(
        time: (number | string),
        value: (number | string),
        sensorId: string,
        geoHash: string,
        metricId: string,
    ) {
        const date = new Date(time);
        const latlon = geohash.decode(geoHash);
        return {
            "@id": JSONLDConfig.baseURL + metricId + "/" + sensorId + "/" + time,
            "@type": "sosa:Observation",
            "sosa:hasSimpleResult": value,
            "sosa:resultTime": date.toISOString(),
            "sosa:observedProperty": JSONLDConfig.baseURL + metricId,
            "sosa:madeBySensor": JSONLDConfig.baseURL + sensorId,
            "sosa:hasFeatureOfInterest": JSONLDConfig.baseURL + JSONLDConfig.FeatureOfInterest,
            "geo:lat": latlon.latitude,
            "geo:long": latlon.longitude,
        };
    }

    private buildObservations(results: IQueryResults) {
        const observations = [];
        const colNrTime: number = results.columns.indexOf(AirQualityServerConfig.timeColumnName);
        const colNrValue: number = results.columns.indexOf(AirQualityServerConfig.valueColumnName);
        const colNrSensorId: number = results.columns.indexOf(AirQualityServerConfig.sourceIdColumnName);
        const colNrGeoHash: number = results.columns.indexOf(AirQualityServerConfig.geoHashColumnName);

        for (const mr of results.metricResults) {
            for (const v of mr.values) {
                observations.push(this.buildObservation(
                    v[colNrTime],
                    v[colNrValue],
                    v[colNrSensorId].toString(),
                    v[colNrGeoHash].toString(),
                    mr.metricId,
                ));
            }
        }
        return observations;
    }
}
