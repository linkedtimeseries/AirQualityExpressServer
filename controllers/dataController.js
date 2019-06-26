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
const AirQualityServerConfig_1 = require("../AirQualityServerConfig");
const JSONLDDataBuilder_1 = require("../JSONLD/JSONLDDataBuilder");
let auth = null;
function startAuth() {
    return __awaiter(this, void 0, void 0, function* () {
        auth = new Authentication_1.ObeliskClientAuthentication(AirQualityServerConfig_1.AirQualityServerConfig.ObeliskClientId, AirQualityServerConfig_1.AirQualityServerConfig.ObeliskClientSecret, false);
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
        let metadata = yield (new OQMetadata_1.ObeliskQueryMetadata(AirQualityServerConfig_1.AirQualityServerConfig.scopeId, yield getAuth(), true)).GetMetrics();
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
function processEvents(data, geoHashUtils, metrics) {
    let queryResults = new QueryResults_1.QueryResults();
    queryResults.columns = data[0].results.columns;
    let id = 0;
    for (let d of data) {
        let metricResults = new QueryResults_1.MetricResults(metrics[id]);
        id++;
        //filter geoHashes - within tile requirement
        let colNr = d.results.columns.indexOf(AirQualityServerConfig_1.AirQualityServerConfig.geoHashColumnName);
        for (let r of d.results.values) {
            let ii = geoHashUtils.isWithinTile(r[colNr].toString());
            if (ii) {
                metricResults.AddValues(r);
            }
        }
        queryResults.AddMetricResults(metricResults);
    }
    return queryResults;
}
//date is always UTC
exports.data_get_z_x_y_page = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let metrics;
        try {
            //get metrics from request
            if (req.query.metrics) {
                metrics = req.query.metrics.split(',');
                console.log('metrics:', metrics);
            }
            else { //option : if no metricids are given, take all from metaquery
                metrics = yield getMetricIds(AirQualityServerConfig_1.AirQualityServerConfig.scopeId);
                console.log(metrics);
                //console.log("no metrics");            
                //throw "no metrics";
            }
            //convert tile to geoHashes
            let tile = { x: Number(req.params.tile_x), y: Number(req.params.tile_y), zoom: Number(req.params.zoom) };
            let date = (new Date(req.query.page)).setUTCHours(0, 0, 0, 0);
            let fromDate = date;
            let toDate = date + 86400000; //window is 1 day
            console.log(fromDate, toDate, new Date(fromDate), new Date(toDate));
            let geoHashUtiles = new GeoHashUtils_1.GeoHashUtils(tile);
            let gHashes = geoHashUtiles.getGeoHashes();
            console.log(gHashes);
            let DR = yield getObeliskDataRetrievalOperations(AirQualityServerConfig_1.AirQualityServerConfig.scopeId);
            let qRes = new Array();
            for (let i = 0; i < metrics.length; i++) {
                qRes[i] = DR.GetEvents(metrics[i], gHashes, fromDate, toDate);
                //qRes[i] = DR.GetEventsLatest(metrics[i], gHashes);
            }
            let QR = yield Promise.all(qRes).then(data => { return processEvents(data, geoHashUtiles, metrics); }); //.then(data => res.send(data));      
            let builder = new JSONLDDataBuilder_1.JSONLDDataBuilder(QR);
            builder.buildData();
            let json = builder.getJSONLD();
            console.log(json);
            res.send(json);
            //res.send(QR);
        }
        catch (error) {
            console.log(error);
            res.send(error);
        }
    });
};
//# sourceMappingURL=dataController.js.map