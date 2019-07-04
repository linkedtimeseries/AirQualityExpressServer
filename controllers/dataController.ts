import { ObeliskClientAuthentication } from "../utils/Authentication";
import { ObeliskDataRetrievalOperations } from "../ObeliskQuery/ODataRetrievalOperations";
import { IObeliskSpatialQueryCodeAndResults, IObeliskMetadataMetricsQueryCodeAndResults } from "../ObeliskQuery/ObeliskQueryInterfaces";
import { GeoHashUtils, Tile } from "../utils/GeoHashUtils";
import { ObeliskQueryMetadata } from "../ObeliskQuery/OQMetadata";
import { IQueryResults, IMetricResults } from "../API/APIInterfaces";
import { QueryResults, MetricResults } from "../API/QueryResults";
import { AirQualityServerConfig } from "../AirQualityServerConfig";
import { JSONLDDataBuilder } from "../JSONLD/JSONLDDataBuilder";
import { JSONLDBuilder } from "../JSONLD/JSONLDBuilder";

let airQualityServerConfig = new AirQualityServerConfig();

let auth: ObeliskClientAuthentication = null;
async function startAuth(): Promise<void> {
    auth = new ObeliskClientAuthentication(airQualityServerConfig.ObeliskClientId, airQualityServerConfig.ObeliskClientSecret, false);
    await auth.initTokens();
}
async function getAuth(): Promise<ObeliskClientAuthentication> {
    if (!auth) await startAuth();
    return auth;
}


let obeliskDataRetrievalOperations: ObeliskDataRetrievalOperations = null;
async function startObeliskDataRetrievalOperations(scopeId: string): Promise<void> {
    obeliskDataRetrievalOperations = new ObeliskDataRetrievalOperations(scopeId, await getAuth(), true);
}
async function getObeliskDataRetrievalOperations(scopeId: string): Promise<ObeliskDataRetrievalOperations> {
    if (!obeliskDataRetrievalOperations) await startObeliskDataRetrievalOperations(scopeId);
    return obeliskDataRetrievalOperations;
}


let metricIds: string[] = new Array();
async function startGetMetricIds(scopeId: string): Promise<void> {
    let metadata: IObeliskMetadataMetricsQueryCodeAndResults = await (new ObeliskQueryMetadata(AirQualityServerConfig.scopeId, await getAuth(), true)).GetMetrics();
    for (let x of metadata.results) {
        metricIds.push(x.id);
    }
}
async function getMetricIds(scopeId: string): Promise<string[]> {
    if (metricIds.length == 0) await startGetMetricIds(scopeId);
    return metricIds;
}

function processEvents(data: IObeliskSpatialQueryCodeAndResults[], geoHashUtils: GeoHashUtils, metrics): IQueryResults {
    let queryResults = new QueryResults();
    let id: number = 0;
    if (data.length == 0) return null;
    for (let d of data) {
        if ((d.responseCode == 200) && (d.results!=null)) {
            if (queryResults.columns.length == 0) queryResults.columns = d.results.columns;
            let metricResults: IMetricResults = new MetricResults(metrics[id]);
            id++;
            //filter geoHashes - within tile requirement
            let colNr = d.results.columns.indexOf(AirQualityServerConfig.geoHashColumnName);
            for (let r of d.results.values) {
                let ii = geoHashUtils.isWithinTile(r[colNr].toString());
                if (ii) {
                    metricResults.AddValues(r);
                }
            }
            queryResults.AddMetricResults(metricResults);
        }
    }
    return queryResults;
}

//date is always UTC
exports.data_get_z_x_y_page = async function (req, res): Promise<void> {
    let metrics: string[];
    let geoHashUtiles: GeoHashUtils;
    let gHashes: string[];
    let date: number;
    let fromDate: number;
    let toDate: number;
    let QR: IQueryResults;

    try {        
        //convert tile to geoHashes
        let tile: Tile = { x: Number(req.params.tile_x), y: Number(req.params.tile_y), zoom: Number(req.params.zoom) };
        if (tile.zoom != 14) {
            res.status(400).send("only zoom level 14 allowed");
            return;
        }
        try {
            geoHashUtiles = new GeoHashUtils(tile);
            gHashes = geoHashUtiles.getGeoHashes();
        }
        catch (e) {
            res.status(400).send("geoHash error : " + e);
            return;
        }
        //get metrics from request
        try {
            if (req.query.metrics) {
                metrics = req.query.metrics.split(',');
                console.log('metrics:', metrics);
            }
            else { //option : if no metricids are given, take all from metaquery
                metrics = await getMetricIds(AirQualityServerConfig.scopeId);
                console.log(metrics);
            }            
        }
        catch (e) {
            res.status(400).send("metrics error : " + e);
            return;
        }
        //date
        try {
            date = (new Date(req.query.page)).setUTCHours(0, 0, 0, 0);
            if (isNaN(date)) {
                throw new Error("date isNaN");
            }
            fromDate = date;
            toDate = date + AirQualityServerConfig.dateTimeFrame; 
        }
        catch (e) {
            res.status(400).send("date error : " + e);
            return;
        }
        try {
            //query obelisk
            let DR: ObeliskDataRetrievalOperations = await getObeliskDataRetrievalOperations(AirQualityServerConfig.scopeId);
            let qRes: Promise<IObeliskSpatialQueryCodeAndResults>[] = new Array();
            for (let i = 0; i < metrics.length; i++) {
                qRes[i] = DR.GetEvents(metrics[i], gHashes, fromDate, toDate);
            }
            QR = await Promise.all(qRes).then(data => { return processEvents(data, geoHashUtiles, metrics); });    
            if (QR.isEmpty()) {
                res.status(400).send("query error : no results");
                return;
            }
        }
        catch (e) {
            res.status(400).send("query error : " + e);
            return;
        }
        try {
            //convert to jsonld
            let builder: JSONLDBuilder = new JSONLDBuilder(tile, req.query.page, QR);
            builder.buildData();
            let json: string = builder.getJSONLD();
            res.send(json);
        }
        catch (e) {
            res.status(400).send("jsonld convert error : " + e);
            return;
        }
    }
    catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
 }
