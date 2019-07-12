"use strict";
//This class let you build the JSONLD output based on the retrieved results (QR) and query parameters.
//  step 1 - get the JSONLD context (from JSONLDConfig)
//  step 2 - add the information on the Document (from JSONLDDocumentBuilder)
//  step 3 - add the actual data (sosa standard) (from JSONLDDataBuilder)
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