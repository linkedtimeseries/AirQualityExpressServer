import { ObeliskClientAuthentication } from "../utils/Authentication";
import { ObeliskDataRetrievalOperations } from "../ObeliskQuery/ODataRetrievalOperations";

let auth: ObeliskClientAuthentication = null;

async function startAuth() : Promise<void> {
    auth = new ObeliskClientAuthentication('smart-flanders-linked-air-quality', '87bf0a72-bbdf-4aa6-962f-12ae1bf82d80', false);
    await auth.initTokens();
}

async function getAuth(): Promise<ObeliskClientAuthentication> {
    if (!auth) await startAuth();
    return auth;
}

let obeliskDataRetrievalOperations: ObeliskDataRetrievalOperations = null;

async function startObeliskDataRetrievalOperations(scopeId : string): Promise<void> {
    obeliskDataRetrievalOperations = new ObeliskDataRetrievalOperations(scopeId, await getAuth(), true);
}

async function getObeliskDataRetrievalOperations(scopeId: string): Promise<ObeliskDataRetrievalOperations> {
    if (!obeliskDataRetrievalOperations) await startObeliskDataRetrievalOperations(scopeId);
    return obeliskDataRetrievalOperations;
}

exports.data_get_z_x_y_page = async function (req, res) : Promise<void> {
    let scopeId: string = 'cot.airquality';
    let metricId: string = 'airquality.no2';

    let DR: ObeliskDataRetrievalOperations = await getObeliskDataRetrievalOperations(scopeId);
    let results = await DR.GetEvents(metricId, ['u155kr', 'u155ks'], 1514799902820, 1514799909820);
    res.send(results);
    //res.send('Not Implemented : \nzoom :' + req.params.zoom + '\ntile_x : ' + req.params.tile_x + '\ntile_y : ' + req.params.tile_y+' page : '+req.param('page'));
}
