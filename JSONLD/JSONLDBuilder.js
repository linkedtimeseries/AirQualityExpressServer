"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSONLDDataBuilder_1 = require("./JSONLDDataBuilder");
const JSONLDDocumentBuilder_1 = require("./JSONLDDocumentBuilder");
const JSONLDconfig_1 = require("./JSONLDconfig");
class JSONLDBuilder {
    constructor(tile, observationTimeQuery, QR) {
        this.dataBuilder = new JSONLDDataBuilder_1.JSONLDDataBuilder(QR);
        this.documentBuilder = new JSONLDDocumentBuilder_1.JSONLDDocumentBuilder(tile, observationTimeQuery);
    }
    buildData() {
        this.dataBuilder.buildData();
        this.documentBuilder.buildDocument();
        this.json = "{" + JSONLDconfig_1.JSONLDConfig.context;
        this.json += ',' + this.documentBuilder.getJSONLD();
        this.json += ',' + this.dataBuilder.getJSONLD();
        this.json += "}";
    }
    getJSONLD() {
        return this.json;
    }
}
exports.JSONLDBuilder = JSONLDBuilder;
//# sourceMappingURL=JSONLDBuilder.js.map