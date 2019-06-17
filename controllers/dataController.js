"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Authentication_1 = require("../utils/Authentication");
const ODataRetrievalOperations_1 = require("../ObeliskQuery/ODataRetrievalOperations");
const GeoHashUtils_1 = require("../utils/GeoHashUtils");
const OQMetadata_1 = require("../ObeliskQuery/OQMetadata");
const QueryResults_1 = require("../API/QueryResults");
let auth = null;
function startAuth() {
    return __awaiter(this, void 0, void 0, function* () {
        auth = new Authentication_1.ObeliskClientAuthentication('smart-flanders-linked-air-quality', '87bf0a72-bbdf-4aa6-962f-12ae1bf82d80', false);
        yield auth.initTokens();
    });
}
function getAuth() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!auth)
            yield startAuth();
        return auth;
    });
}
let obeliskDataRetrievalOperations = null;
function startObeliskDataRetrievalOperations(scopeId) {
    return __awaiter(this, void 0, void 0, function* () {
        obeliskDataRetrievalOperations = new ODataRetrievalOperations_1.ObeliskDataRetrievalOperations(scopeId, yield getAuth(), true);
    });
}
function getObeliskDataRetrievalOperations(scopeId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!obeliskDataRetrievalOperations)
            yield startObeliskDataRetrievalOperations(scopeId);
        return obeliskDataRetrievalOperations;
    });
}
let metricIds = new Array();
function startGetMetricIds(scopeId) {
    return __awaiter(this, void 0, void 0, function* () {
        let metadata = yield (new OQMetadata_1.ObeliskQueryMetadata('cot.airquality', yield getAuth(), true)).GetMetrics();
        for (let x of metadata.results) {
            metricIds.push(x.id);
        }
    });
}
function getMetricIds(scopeId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (metricIds.length == 0)
            yield startGetMetricIds(scopeId);
        return metricIds;
    });
}
exports.data_get_z_x_y = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let scopeId = 'cot.airquality';
        //let metricId: string = 'airquality.no2';
        let metrics;
        let queryResults;
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
            queryResults = new QueryResults_1.QueryResults();
            //convert tile to geoHashes
            let tile = { x: Number(req.params.tile_x), y: Number(req.params.tile_y), zoom: Number(req.params.zoom) };
            //let t: Tile = { x: 4195, y: 2734, zoom: 13 };
            let geoHashUtiles = new GeoHashUtils_1.GeoHashUtils(tile);
            let gHashes = geoHashUtiles.getGeoHashes();
            console.log(gHashes);
            let DR = yield getObeliskDataRetrievalOperations(scopeId);
            for (let metricId of metrics) {
                console.log(metricId);
                let qRes = yield DR.GetEventsLatest(metricId, gHashes);
                queryResults.columns = qRes.results.columns;
                let metricResults = new QueryResults_1.MetricResults(metricId);
                //filter geoHashes - within tile requirement
                let colNr = qRes.results.columns.indexOf('geohash');
                //console.log(colNr);
                //let values: (string | number)[][] = new Array();
                for (let r of qRes.results.values) {
                    let ii = geoHashUtiles.isWithinTile(r[colNr].toString());
                    //console.log(ii, r[colNr]);
                    if (ii) {
                        //values.push(r);
                        metricResults.AddValues(r);
                    }
                }
                //metricResults.AddValues(values);
                queryResults.AddMetricResults(metricResults);
                //qRes.results.values = values;
            }
            //let results: ObeliskSpatialQueryCodeAndResults = await DR.GetEvents(metricId, gHashes, 1514799902820, 1514799909820);
            res.send(queryResults);
        }
        catch (error) {
            console.log(error);
            res.send(error);
        }
        //res.send('Not Implemented : \nzoom :' + req.params.zoom + '\ntile_x : ' + req.params.tile_x + '\ntile_y : ' + req.params.tile_y+' page : '+req.param('page'));
    });
};
//# sourceMappingURL=dataController.js.map