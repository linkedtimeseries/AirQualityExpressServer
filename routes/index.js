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
const OQSpatial_1 = require("../ObeliskQuery/OQSpatial");
const router = express.Router();
router.get('/', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //res.redirect('/data');
        let auth = new Authentication_1.ObeliskClientAuthentication('smart-flanders-linked-air-quality', '87bf0a72-bbdf-4aa6-962f-12ae1bf82d80');
        yield auth.initTokens();
        let SQ = new OQSpatial_1.ObeliskQuerySpatial('cot.airquality', auth, false);
        let status;
        let results;
        //[status,results]=await SQ.GetRawEventsFromTo('airquality.no2', 'u155k', 1514799902820, 1514799909820);
        [status, results] = yield SQ.GetRawEventsDateFromTo('airquality.no2', 'u155k', '20190521');
        yield new Promise(resolve => setTimeout(resolve, 3000));
        [status, results] = yield SQ.GetRawEventsDateFromTo('airquality.no2', 'u155k', '20190521');
        //let Qapi = new ObeliskQueryMetadata('cot.airquality',auth);
        //[status, results] = await Qapi.GetMetrics();
        //[status, results] = await Qapi.GetThings();
        //res.send(auth.showTokens());
        res.send([status, results]);
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map