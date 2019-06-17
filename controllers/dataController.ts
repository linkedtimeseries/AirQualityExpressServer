﻿import { ObeliskClientAuthentication } from "../utils/Authentication";
import { ObeliskDataRetrievalOperations } from "../ObeliskQuery/ODataRetrievalOperations";
import { IObeliskSpatialQueryCodeAndResults, IObeliskMetadataMetricsQueryCodeAndResults } from "../ObeliskQuery/ObeliskQueryInterfaces";
import { GeoHashUtils, Tile } from "../utils/GeoHashUtils";
import { ObeliskQueryMetadata } from "../ObeliskQuery/OQMetadata";
import { IQueryResults, IMetricResults } from "../API/APIInterfaces";
import { QueryResults, MetricResults } from "../API/QueryResults";


let auth: ObeliskClientAuthentication = null;
async function startAuth() : Promise<void> {
    auth = new ObeliskClientAuthentication('smart-flanders-linked-air-quality', '87bf0a72-bbdf-4aa6-962f-12ae1bf82d80', false);
    await auth.initTokens();
}
async function getAuth(): Promise<ObeliskClientAuthentication> {
    if (!auth) await startAuth();
    return auth;
}


let obeliskDataRetrievalOperations: ObeliskDataRetrievalOperations = null;
async function startObeliskDataRetrievalOperations(scopeId : string): Promise<void> {
    obeliskDataRetrievalOperations = new ObeliskDataRetrievalOperations(scopeId, await getAuth(), true);
}
async function getObeliskDataRetrievalOperations(scopeId: string): Promise<ObeliskDataRetrievalOperations> {
    if (!obeliskDataRetrievalOperations) await startObeliskDataRetrievalOperations(scopeId);
    return obeliskDataRetrievalOperations;
}


let metricIds: string[] = new Array();
async function startGetMetricIds(scopeId: string): Promise<void> {
    let metadata: IObeliskMetadataMetricsQueryCodeAndResults = await (new ObeliskQueryMetadata('cot.airquality', await getAuth(), true)).GetMetrics();
    for (let x of metadata.results) {
        metricIds.push(x.id);
    }
}
async function getMetricIds(scopeId: string): Promise<string[]> {
    if (metricIds.length == 0) await startGetMetricIds(scopeId);
    return metricIds;
}


exports.data_get_z_x_y = async function (req, res) : Promise<void> {
    let scopeId: string = 'cot.airquality';
    //let metricId: string = 'airquality.no2';
    let metrics: string[];
    let queryResults: IQueryResults;

    try {
        //get metrics from request
        if (req.query.metrics) {
            metrics = req.query.metrics.split(',');
            console.log('metrics:', metrics);
        }
        else {
            //let m = await getMetricIds(scopeId);
            //console.log(m);
            console.log("no metrics");            
            throw "no metrics";
        }
        queryResults = new QueryResults();

        //convert tile to geoHashes
        let tile: Tile = { x: Number(req.params.tile_x), y: Number(req.params.tile_y), zoom: Number(req.params.zoom) };
        //let t: Tile = { x: 4195, y: 2734, zoom: 13 };
        let geoHashUtiles = new GeoHashUtils(tile);
        let gHashes: string[] = geoHashUtiles.getGeoHashes();
        console.log(gHashes);
        let DR: ObeliskDataRetrievalOperations = await getObeliskDataRetrievalOperations(scopeId);
        for (let metricId of metrics) {
            console.log(metricId);
            let qRes: IObeliskSpatialQueryCodeAndResults = await DR.GetEventsLatest(metricId, gHashes);

            queryResults.columns = qRes.results.columns;
            let metricResults: IMetricResults = new MetricResults(metricId);

            //filter geoHashes - within tile requirement
            let colNr = qRes.results.columns.indexOf('geohash');
            //console.log(colNr);
            for (let r of qRes.results.values) {
                let ii = geoHashUtiles.isWithinTile(r[colNr].toString());
                //console.log(ii, r[colNr]);
                if (ii) {
                    metricResults.AddValues(r);
                }
            }
            queryResults.AddMetricResults(metricResults);          
        }       
        res.send(queryResults);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }    
    //res.send('Not Implemented : \nzoom :' + req.params.zoom + '\ntile_x : ' + req.params.tile_x + '\ntile_y : ' + req.params.tile_y+' page : '+req.param('page'));
}