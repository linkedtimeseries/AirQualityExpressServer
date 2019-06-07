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
const express = require("express");
const Authentication_1 = require("../utils/Authentication");
const OQMetadata_1 = require("../ObeliskQuery/OQMetadata");
const OQSpatial_1 = require("../ObeliskQuery/OQSpatial");
const ODataRetrievalOperations_1 = require("../ObeliskQuery/ODataRetrievalOperations");
const router = express.Router();
router.get('/', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //let testQuery: string = "DR";
        let testQuery = "Meta";
        //let testQuery: string = "Spatial";
        let auth = new Authentication_1.ObeliskClientAuthentication('smart-flanders-linked-air-quality', '87bf0a72-bbdf-4aa6-962f-12ae1bf82d80', false);
        yield auth.initTokens();
        //res.send(auth.showTokens());
        switch (testQuery) {
            case "DR": {
                let DR = new ODataRetrievalOperations_1.ObeliskDataRetrievalOperations('cot.airquality', auth, true);
                let results = yield DR.GetEvents('airquality.no2', ['u155kr', 'u155ks'], 1514799902820, 1514799909820);
                //let results = await DR.GetEvents('airquality.no2', ['u155kr', 'u155ks']);
                //let results = await DR.GetEventsLatest('airquality.no2', ['u155kr', 'u155ks']);
                //let results = await DR.GetStats('airquality.no2', ['u155kr', 'u155ks']);
                res.send(results);
                break;
            }
            case "Meta": {
                ////Metadata queries - test
                let Qapi = new OQMetadata_1.ObeliskQueryMetadata('cot.airquality', auth, true);
                let results = yield Qapi.GetMetrics();
                //results = await Qapi.GetThings();
                res.send(results);
                break;
            }
            case "Spatial": {
                let SQ = new OQSpatial_1.ObeliskQuerySpatial('cot.airquality', auth, false);
                let results = yield SQ.GetRawEventsDateFromTo('airquality.no2', 'u155k', '20190521');
                //let results: ObeliskSpatialQueryCodeAndResults = await SQ.GetRawEventsFromTo('airquality.no2', 'u155kr', 1514799902820, 1514799909820);
                //await new Promise(resolve => setTimeout(resolve, 3000));
                res.send(results);
                break;
            }
        }
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map