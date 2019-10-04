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

    public build(results: IQueryResults, fromDate: number, avgType: string): object {
        const graph = [];
        graph.push(this.buildFeatureOfInterest());
        graph.concat(
            this.buildObservableProperties(results),
            this.buildSensors(results),

        );
        // TODO: switch to enum
        const types = new Set(["min", "hour", "day"]);
        if (types.has(avgType)) {
            return graph.concat(this.buildAverageObservations(results, fromDate, avgType));
        } else {
            return graph.concat(this.buildObservations(results));
        }
    }

    private buildFeatureOfInterest() {
        return {
            "@id": JSONLDConfig.baseURL + JSONLDConfig.FeatureOfInterest,
            "@type": "sosa:FeatureOfInterest",
            "label": JSONLDConfig.FeatureOfInterest,
        };
    }

    private buildObservableProperty(metricId: string) {
        return {
            "@id": JSONLDConfig.baseURL + metricId,
            "@type": "sosa:ObervableProperty",
            "label": "metricId=" + metricId,
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
            "label": "sourceId=" + sensorId,
            "observes": metrics,
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
            "hasSimpleResult": value,
            "resultTime": date.toISOString(),
            "observedProperty": JSONLDConfig.baseURL + metricId,
            "madeBySensor": JSONLDConfig.baseURL + sensorId,
            "hasFeatureOfInterest": JSONLDConfig.baseURL + JSONLDConfig.FeatureOfInterest,
            "lat": latlon.latitude,
            "long": latlon.longitude,
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

    private buildAverageObservation(
        time: (number | string),
        value: (number | string),
        metricId: string,
    ) {
        const date = new Date(time);
        return {
            "@id": JSONLDConfig.baseURL + metricId + "/" + time,
            "@type": "sosa:Observation",
            "hasSimpleResult": value,
            "resultTime": date.toISOString(),
            "observedProperty": JSONLDConfig.baseURL + metricId,
            "hasFeatureOfInterest": JSONLDConfig.baseURL + JSONLDConfig.FeatureOfInterest,
        };
    }

    // same as buildObservations, but builds observations averaged over 5 minutes
    // assumptions:
    // - all observations are in the same tile
    // TODO: mention sensors?
    private buildAverageObservations(results: IQueryResults, startDate: number, avgType: string) {
        const avgMinuteObservations = [];
        // startDate + 5 minutes
        let nextAvg: number = startDate;
        let timeInterval = 0;

        switch (avgType) {
            case "min":
                timeInterval = 300000;
                break;
            case "hour":
                timeInterval = 3600000;
                break;
            case "day":
                timeInterval = 86400000;
        }
        // total of observation values of 5 minutes
        let tempTotal: number = 0;
        // total count of observations of 5 minutes
        let count: number = 0;

        const colNrTime: number = results.columns.indexOf(AirQualityServerConfig.timeColumnName);
        const colNrValue: number = results.columns.indexOf(AirQualityServerConfig.valueColumnName);

        for (const mr of results.metricResults) {
            // some metrics have no values
            if (mr.values.length === 0) {
                continue;
            }
            for (const v of mr.values) {
                if (v[colNrTime] <= nextAvg) {
                    tempTotal = tempTotal + Number(v[colNrValue]);
                    count++;
                } else {
                    console.log("tempTotal: " + tempTotal);
                    console.log("count: " + count);
                    // only add an average if there are values in the time interval
                    if (count > 0) {
                        const nextObs = this.buildAverageObservation(
                            nextAvg,
                            tempTotal / count,
                            mr.metricId,
                        );
                        console.log(JSON.stringify(nextObs));
                        avgMinuteObservations.push(nextObs);
                    }
                    nextAvg += timeInterval;
                    tempTotal = 0;
                    count = 0;
                }
            }
            avgMinuteObservations.push(this.buildAverageObservation(
                nextAvg,
                tempTotal / count,
                mr.metricId,
            ));
            nextAvg = startDate;
            tempTotal = 0;
            count = 0;
        }

        return avgMinuteObservations;
    }

}
