// This class let you build the JSONLD output based on the retrieved results (QR) and query parameters.
//  step 1 - get the JSONLD context (from JSONLDConfig)
//  step 2 - add the information on the Document (from JSONLDDocumentBuilder)
//  step 3 - add the actual data (sosa standard) (from JSONLDDataBuilder)

import IQueryResults from "../API/IQueryResults";
import ITile from "../utils/ITile";
import JSONLDConfig from "./JSONLDConfig";
import JSONLDDataBuilder from "./JSONLDDataBuilder";
import JSONLDDocumentBuilder from "./JSONLDDocumentBuilder";

export default class JSONLDBuilder {
    public build(tile: ITile, page: Date, results: IQueryResults, fromDate: number, avgType: string): object {
        const dataBuilder = new JSONLDDataBuilder();
        const documentBuilder = new JSONLDDocumentBuilder();
        const blob = documentBuilder.build(tile, page);
        blob["@context"] = JSONLDConfig.context;
        blob["@graph"] = dataBuilder.build(results, fromDate, avgType);
        return blob;
    }
}
