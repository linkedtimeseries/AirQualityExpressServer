import AirQualityServerConfig from "../AirQualityServerConfig";
import IMetricResults from "../API/IMetricResults";
import IQueryResults from "../API/IQueryResults";
import MetricResults from "../API/MetricResults";
import QueryResults from "../API/QueryResults";
import JSONLDBuilder from "../JSONLD/JSONLDBuilder";
import {
    IObeliskMetadataMetricsQueryCodeAndResults,
    IObeliskSpatialQueryCodeAndResults,
} from "../ObeliskQuery/ObeliskQueryInterfaces";
import ObeliskDataRetrievalOperations from "../ObeliskQuery/ODataRetrievalOperations";
import ObeliskQueryMetadata from "../ObeliskQuery/OQMetadata";
import ObeliskClientAuthentication from "../utils/Authentication";
import GeoHashUtils from "../utils/GeoHashUtils";
import ITile from "../utils/ITile";

const airQualityServerConfig = new AirQualityServerConfig();

// Make an ObeliskClientAuthentication object available.
// If the object is not available yet, create it and get the Tokens
let auth: ObeliskClientAuthentication = null;

async function startAuth(): Promise<void> {
    auth = new ObeliskClientAuthentication(
        airQualityServerConfig.obeliskClientId,
        airQualityServerConfig.obeliskClientSecret,
        false,
    );
    await auth.initTokens();
}

async function getAuth(): Promise<ObeliskClientAuthentication> {
    if (!auth) {
        await startAuth();
    }
    return auth;
}

// Make ObeliskDataRetrievalOperations object available.
// If the object is not available yet, create it.
let obeliskDataRetrievalOperations: ObeliskDataRetrievalOperations = null;
async function startObeliskDataRetrievalOperations(scopeId: string): Promise<void> {
    obeliskDataRetrievalOperations = new ObeliskDataRetrievalOperations(scopeId, await getAuth(), true);
}
async function getObeliskDataRetrievalOperations(scopeId: string): Promise<ObeliskDataRetrievalOperations> {
    if (!obeliskDataRetrievalOperations) {
        await startObeliskDataRetrievalOperations(scopeId);
    }
    return obeliskDataRetrievalOperations;
}

// Make metricIds available.
// If no values available get metrics from Obelisk via ObeliskQueryMetadata.
const metricIds: string[] = new Array();
async function startGetMetricIds(scopeId: string): Promise<void> {
    const metadata: IObeliskMetadataMetricsQueryCodeAndResults = await (
        new ObeliskQueryMetadata(AirQualityServerConfig.scopeId, await getAuth(), true)
    ).getMetrics();
    for (const x of metadata.results) {
        metricIds.push(x.id);
    }
}

async function getMetricIds(scopeId: string): Promise<string[]> {
    if (metricIds.length === 0) {
        await startGetMetricIds(scopeId);
    }
    return metricIds;
}

// processEvents construct a QueryResults object from the received IObeliskSpatialQueryCodeAndResults list.
function processEvents(data: IObeliskSpatialQueryCodeAndResults[], geoHashUtils: GeoHashUtils, metrics): IQueryResults {
    const queryResults = new QueryResults();
    let id: number = 0;
    if (data.length === 0) {
        return null;
    }
    for (const d of data) {
        if ((d.responseCode === 200) && (d.results != null)) {
            if (queryResults.columns.length === 0) {
                queryResults.columns = d.results.columns;
            }
            const metricResults: IMetricResults = new MetricResults(metrics[id]);
            id++;
            // filter geoHashes - within tile requirement
            const colNr = d.results.columns.indexOf(AirQualityServerConfig.geoHashColumnName);
            for (const r of d.results.values) {
                const ii = geoHashUtils.isWithinTile(r[colNr].toString());
                if (ii) {
                    metricResults.addValues(r);
                }
            }
            queryResults.addMetricResults(metricResults);
        }
    }
    return queryResults;
}

// Process the get /zoom/x/y/page request
// step 1 - redirect the client to the proper document if needed
// step 2 - convert tile info to geohashes
// step 3 - get the metricIds (remark : currently metrics can still be given in the get request,
//          should standard be all metrics)
// step 4 - get the query date from request
// step 5 - query the obelisk API and contruct a QueryResults output
// step 6 - construct the JSONLD output
export async function data_get_z_x_y_page(req, res) {
    let metrics: string[];
    let geoHashUtils: GeoHashUtils;
    let gHashes: string[];
    let page: Date;
    let fromDate: number;
    let toDate: number;
    let QR: IQueryResults;

    try {
        page = new Date(decodeURIComponent(req.query.page));
        // Re-direct to now time if no date is provided
        if (page.toString() === "Invalid Date") {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            res.location("/data/14/" + req.params.tile_x + "/" + req.params.tile_y + "?page=" + today.toISOString());
            res.status(302).send();
            return;
        }

        // Re-direct to today's date if necessary
        if (page.getUTCHours() !== 0 || page.getUTCMinutes() !== 0 || page.getUTCSeconds() !== 0
            || page.getUTCMilliseconds() !== 0) {
            page.setUTCHours(0, 0, 0, 0);
            res.location("/data/14/" + req.params.tile_x + "/" + req.params.tile_y + "?page=" + page.toISOString());
            res.status(302).send();
            return;
        }
        // convert tile to geoHashes
        const tile: ITile = {
            x: Number(req.params.tile_x),
            y: Number(req.params.tile_y),
            zoom: Number(req.params.zoom),
        };
        if (tile.zoom !== 14) {
            res.status(400).send("only zoom level 14 is allowed");
            return;
        }
        // calculate geohashes
        try {
            geoHashUtils = new GeoHashUtils(tile);
            gHashes = geoHashUtils.getGeoHashes();
        } catch (e) {
            res.status(400).send("geoHash error : " + e);
            return;
        }
        // get metrics from request
        try {
            if (req.query.metrics) {
                metrics = req.query.metrics.split(",");
                console.log("metrics:", metrics);
            } else { // option : if no metricids are given, take all from metaquery
                metrics = await getMetricIds(AirQualityServerConfig.scopeId);
                console.log(metrics);
            }
        } catch (e) {
            res.status(400).send("metrics error : " + e);
            return;
        }
        // date is always UTC
        // get date from url request
        try {
            fromDate = page.getTime();
            toDate = page.getTime() + AirQualityServerConfig.dateTimeFrame;
        } catch (e) {
            res.status(400).send("date error : " + e);
            return;
        }
        // query obelisk
        try {
            const DR = await getObeliskDataRetrievalOperations(AirQualityServerConfig.scopeId);
            const qRes: Array<Promise<IObeliskSpatialQueryCodeAndResults>> = new Array();
            for (let i = 0; i < metrics.length; i++) {
                qRes[i] = DR.getEvents(metrics[i], gHashes, fromDate, toDate);
            }
            QR = await Promise.all(qRes).then((data) => {
                return processEvents(data, geoHashUtils, metrics);
            });
            if (QR.isEmpty()) {
                res.status(400).send("query error : no results");
                return;
            }
        } catch (e) {
            res.status(400).send("query error : " + e);
            return;
        }
        // convert to jsonld
        try {
            const builder = new JSONLDBuilder();
            const blob = builder.build(tile, req.query.page, QR);
            res.type("application/ld+json; charset=utf-8");
            res.send(blob);
        } catch (e) {
            res.status(400).send("jsonld convert error : " + e);
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
}
