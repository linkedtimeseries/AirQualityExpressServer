//This class let you build the JSONLD output based on the retrieved results (QR) and query parameters.
//  step 1 - get the JSONLD context (from JSONLDConfig)
//  step 2 - add the information on the Document (from JSONLDDocumentBuilder)
//  step 3 - add the actual data (sosa standard) (from JSONLDDataBuilder)

import { JSONLDDataBuilder } from "./JSONLDDataBuilder";
import { JSONLDDocumentBuilder } from "./JSONLDDocumentBuilder";
import { IQueryResults } from "../API/APIInterfaces";
import { JSONLDConfig } from "./JSONLDconfig";
import { Tile } from "../utils/GeoHashUtils";

export class JSONLDBuilder {
    private json: string;
    private dataBuilder: JSONLDDataBuilder;
    private documentBuilder: JSONLDDocumentBuilder;
    constructor(tile:Tile, observationTimeQuery: string, QR: IQueryResults) {
        this.dataBuilder = new JSONLDDataBuilder(QR);
        this.documentBuilder = new JSONLDDocumentBuilder(tile,observationTimeQuery);
    }
    public buildData(): void {
        this.dataBuilder.buildData();
        this.documentBuilder.buildDocument();
        this.json = "{" + JSONLDConfig.context;
        this.json += ',' + this.documentBuilder.getJSONLD();
        this.json += ',' + this.dataBuilder.getJSONLD();
        this.json += "}";
    }
    public getJSONLD(): string {
        return this.json;
    }
}