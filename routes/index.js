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
/*
 * GET home page.
 */
//This route is only used to do some testing !
const express = require("express");
const Authentication_1 = require("../utils/Authentication");
const OQMetadata_1 = require("../ObeliskQuery/OQMetadata");
const ODataRetrievalOperations_1 = require("../ObeliskQuery/ODataRetrievalOperations");
const AirQualityServerConfig_1 = require("../AirQualityServerConfig");
const router = express.Router();
router.get('/', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //let testQuery: string = "DR";
        let testQuery = "Meta";
        //let testQuery: string = "Spatial";
        let airQualityServerConfig = new AirQualityServerConfig_1.AirQualityServerConfig();
        let auth = new Authentication_1.ObeliskClientAuthentication(airQualityServerConfig.ObeliskClientId, airQualityServerConfig.ObeliskClientSecret, false);
        yield auth.initTokens();
        //res.send(auth.showTokens());
        switch (testQuery) {
            case "DR": {
                let DR = new ODataRetrievalOperations_1.ObeliskDataRetrievalOperations(AirQualityServerConfig_1.AirQualityServerConfig.scopeId, auth, true);
                let results = yield DR.getEvents('airquality.no2', ['u155kr', 'u155ks'], 1514799902820, 1514799909820);
                //let results = await DR.GetEvents('airquality.no2', ['u155kr', 'u155ks']);
                //let results = await DR.GetEventsLatest('airquality.no2', ['u155kr', 'u155ks']);
                //let results = await DR.GetStats('airquality.no2', ['u155kr', 'u155ks']);
                res.send(results);
                break;
            }
            case "Meta": {
                ////Metadata queries - test
                let Qapi = new OQMetadata_1.ObeliskQueryMetadata(AirQualityServerConfig_1.AirQualityServerConfig.scopeId, auth, true);
                let results = yield Qapi.getMetrics();
                //for (let x of results.results) {
                //    console.log("x:", x.id);
                //}
                res.send(results);
                break;
            }
        }
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map