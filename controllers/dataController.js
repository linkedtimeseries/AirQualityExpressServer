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
exports.data_get_z_x_y_page = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let scopeId = 'cot.airquality';
        let metricId = 'airquality.no2';
        let DR = yield getObeliskDataRetrievalOperations(scopeId);
        let results = yield DR.GetEvents(metricId, ['u155kr', 'u155ks'], 1514799902820, 1514799909820);
        res.send(results);
        //res.send('Not Implemented : \nzoom :' + req.params.zoom + '\ntile_x : ' + req.params.tile_x + '\ntile_y : ' + req.params.tile_y+' page : '+req.param('page'));
    });
};
//# sourceMappingURL=dataController.js.map