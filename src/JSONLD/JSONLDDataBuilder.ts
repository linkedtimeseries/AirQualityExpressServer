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

    public build(results: IQueryResults, fromDate: number, aggrMethod?: string, aggrPeriod?: string): object {
        const graph = [];
        graph.push(this.buildFeatureOfInterest());
        graph.concat(
            this.buildObservableProperties(results),
            this.buildSensors(results),

        );
        if (! (aggrMethod === "undefined" && aggrPeriod === "undefined")) {
            const aggrPeriods = new Set(["min", "hour", "day", "month"]);
            const aggrMethods = new Set(["average", "median"]);
            if (!aggrMethods.has(aggrMethod)) {
                aggrMethod = "median";
            }
            if (!aggrPeriod || !aggrPeriods.has(aggrPeriod)) {
                aggrPeriod = "hour";
            }
            if (aggrMethod === "median") {
                return graph.concat(this.buildMedianObservations(results, fromDate, aggrPeriod));
            } else {
                return graph.concat(this.buildAverageObservations(results, fromDate, aggrPeriod));
            }
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

    private buildAggregateObservation(
        time: (number | string),
        value: (number | string),
        metricId: string,
        sensors: Set<string | number>,
        usedProcedure: string,
    ) {
        const date = new Date(time);
        const sensorArr = this.convertSensors(sensors);
        return {
            "@id": JSONLDConfig.baseURL + metricId + "/" + time,
            "@type": "sosa:Observation",
            "hasSimpleResult": value,
            "resultTime": date.toISOString(),
            "observedProperty": JSONLDConfig.baseURL + metricId,
            "madeBySensor": sensorArr,
            "usedProcedure": JSONLDConfig.baseURL + "id/" + usedProcedure,
            "hasFeatureOfInterest": JSONLDConfig.baseURL + JSONLDConfig.FeatureOfInterest,
        };
    }

    private convertSensors(sensors: Set<string | number>): string[] {
        const sensorArr: string[] = [];
        for (const sensorId of sensors) {
            sensorArr.push(JSONLDConfig.baseURL + sensorId);
        }
        return sensorArr;
    }

    private getInterval(aggrPeriod: string) {
        switch (aggrPeriod) {
            case "min":
                return JSONLDConfig.minuteInterval;
            case "hour":
                return JSONLDConfig.hourInterval;
            case "day":
                return JSONLDConfig.dayInterval;
            case "month":
                return JSONLDConfig.monthInterval;
            case "year":
                return JSONLDConfig.yearInterval;
        }
    }

    private buildMedianObservations(results: IQueryResults, startDate: number, aggrPeriod: string) {
        const avgMedianObservations = [];
        // startDate + 5 minutes
        let nextMedian: number = startDate;
        const timeInterval = this.getInterval(aggrPeriod);
        nextMedian += timeInterval;
        const tempSensors = new Set<string | number>();

        const colNrTime: number = results.columns.indexOf(AirQualityServerConfig.timeColumnName);
        const colNrValue: number = results.columns.indexOf(AirQualityServerConfig.valueColumnName);
        const colNrSensorId: number = results.columns.indexOf(AirQualityServerConfig.sourceIdColumnName);
        const usedProcedure = "median";

        for (const mr of results.metricResults) {
            // some metrics have no values
            if (mr.values.length === 0) {
                continue;
            }
            let startIntervalIndex = 0;
            for (let i = 0; i < mr.values.length; i++) {
                tempSensors.add(mr.values[i][colNrSensorId]);
                if (mr.values[i][colNrTime] >= nextMedian) {
                    if (i > startIntervalIndex) {
                        const medianResults = mr.values.slice(startIntervalIndex, i);
                        const median = this.getMedian(medianResults, colNrValue);
                        avgMedianObservations.push(this.buildAggregateObservation(
                            nextMedian - timeInterval,
                            median,
                            mr.metricId,
                            tempSensors,
                            usedProcedure,
                        ));
                    }
                    startIntervalIndex = i;
                    tempSensors.clear();
                    nextMedian += timeInterval;
                }
            }
            const medianResults = mr.values.slice(startIntervalIndex);
            const median = this.getMedian(medianResults, colNrValue);
            avgMedianObservations.push(this.buildAggregateObservation(
                nextMedian - timeInterval,
                median,
                mr.metricId,
                tempSensors,
                usedProcedure,
            ));
            nextMedian = startDate;
            tempSensors.clear();
        }

        return avgMedianObservations;
    }

    private getMedian(medianResults, colNrValue: number): number {
        let median: number;
        if (medianResults.length % 2) {
            median = Number(medianResults[Math.floor(medianResults.length / 2)][colNrValue]);
        } else {
            median = Number(medianResults[medianResults.length / 2][colNrValue])
                + Number(medianResults[(medianResults.length / 2) - 1][colNrValue]) / 2;
        }
        return median;
    }

    // same as buildObservations, but builds observations averaged over a certain time interval
    // assumptions:
    // - all observations are in the same tile
    private buildAverageObservations(results: IQueryResults, startDate: number, aggrPeriod: string) {
        const avgMinuteObservations = [];
        // startDate + 5 minutes
        let nextAvg: number = startDate;
        const timeInterval = this.getInterval(aggrPeriod);
        nextAvg += timeInterval;
        // total of observation values between a time interval
        let tempTotal: number = 0;
        // total count of observations between a time interval
        let count: number = 0;
        const tempSensors = new Set<string | number>();

        const colNrTime: number = results.columns.indexOf(AirQualityServerConfig.timeColumnName);
        const colNrValue: number = results.columns.indexOf(AirQualityServerConfig.valueColumnName);
        const colNrSensorId: number = results.columns.indexOf(AirQualityServerConfig.sourceIdColumnName);
        const usedProcedure = "average";

        for (const mr of results.metricResults) {
            // some metrics have no values
            if (mr.values.length === 0) {
                continue;
            }
            for (const v of mr.values) {
                if (v[colNrTime] <= nextAvg) {
                    tempTotal = tempTotal + Number(v[colNrValue]);
                    count++;
                    tempSensors.add(v[colNrSensorId]);
                } else {
                    // only add an average if there are values in the time interval
                    if (count > 0) {
                        const nextObs = this.buildAggregateObservation(
                            nextAvg - timeInterval,
                            tempTotal / count,
                            mr.metricId,
                            tempSensors,
                            usedProcedure,
                        );
                        avgMinuteObservations.push(nextObs);
                    }
                    nextAvg += timeInterval;
                    tempTotal = 0;
                    count = 0;
                    tempSensors.clear();
                }
            }
            avgMinuteObservations.push(this.buildAggregateObservation(
                nextAvg - timeInterval,
                tempTotal / count,
                mr.metricId,
                tempSensors,
                usedProcedure,
            ));
            nextAvg = startDate;
            tempTotal = 0;
            count = 0;
        }

        return avgMinuteObservations;
    }

}
