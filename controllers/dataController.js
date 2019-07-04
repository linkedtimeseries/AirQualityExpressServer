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
const JSONLDBuilder_1 = require("../JSONLD/JSONLDBuilder");
let airQualityServerConfig = new AirQualityServerConfig_1.AirQualityServerConfig();
let auth = null;
function startAuth() {
    return __awaiter(this, void 0, void 0, function* () {
        auth = new Authentication_1.ObeliskClientAuthentication(airQualityServerConfig.ObeliskClientId, airQualityServerConfig.ObeliskClientSecret, false);
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
    let id = 0;
    if (data.length == 0)
        return null;
    for (let d of data) {
        if ((d.responseCode == 200) && (d.results != null)) {
            if (queryResults.columns.length == 0)
                queryResults.columns = d.results.columns;
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
    }
    return queryResults;
}
//date is always UTC
exports.data_get_z_x_y_page = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let metrics;
        let geoHashUtiles;
        let gHashes;
        let date;
        let fromDate;
        let toDate;
        let QR;
        try {
            //convert tile to geoHashes
            let tile = { x: Number(req.params.tile_x), y: Number(req.params.tile_y), zoom: Number(req.params.zoom) };
            if (tile.zoom != 14) {
                res.status(400).send("only zoom level 14 allowed");
                return;
            }
            try {
                geoHashUtiles = new GeoHashUtils_1.GeoHashUtils(tile);
                gHashes = geoHashUtiles.getGeoHashes();
                //throw new Error('geohash processing error');
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
                    metrics = yield getMetricIds(AirQualityServerConfig_1.AirQualityServerConfig.scopeId);
                    console.log(metrics);
                }
                //throw new Error('metrics processing error');
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
                toDate = date + AirQualityServerConfig_1.AirQualityServerConfig.dateTimeFrame;
            }
            catch (e) {
                res.status(400).send("date error : " + e);
                return;
            }
            try {
                //query obelisk
                let DR = yield getObeliskDataRetrievalOperations(AirQualityServerConfig_1.AirQualityServerConfig.scopeId);
                let qRes = new Array();
                for (let i = 0; i < metrics.length; i++) {
                    qRes[i] = DR.GetEvents(metrics[i], gHashes, fromDate, toDate);
                }
                QR = yield Promise.all(qRes).then(data => { return processEvents(data, geoHashUtiles, metrics); }); //.then(data => res.send(data));      
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
                let builder = new JSONLDBuilder_1.JSONLDBuilder(tile, req.query.page, QR);
                builder.buildData();
                let json = builder.getJSONLD();
                //console.log(json);
                res.send(json);
            }
            catch (e) {
                res.status(400).send("jsonld convert error : " + e);
                return;
            }
            //res.send(QR);
        }
        catch (error) {
            console.log(error);
            res.status(400).send(error);
        }
    });
};
//# sourceMappingURL=dataController.js.map