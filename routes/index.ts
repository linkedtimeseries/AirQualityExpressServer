/*
 * GET home page.
 */
import express = require('express');
import { ObeliskClientAuthentication } from '../utils/Authentication';
import { ObeliskQueryMetadata } from '../ObeliskQuery/OQMetadata';
import { ObeliskQuerySpatial } from '../ObeliskQuery/OQSpatial';
import { ObeliskSpatialQueryCodeAndResults } from '../ObeliskQuery/ObeliskQueryInterfaces';
import { ObeliskDataRetrievalOperations } from '../ObeliskQuery/ODataRetrievalOperations';
const router = express.Router();

router.get('/', async function (req, res) {

    //let testQuery: string = "DR";
    //let testQuery: string = "Meta";
    let testQuery: string = "Spatial";

    let auth = new ObeliskClientAuthentication('smart-flanders-linked-air-quality', '87bf0a72-bbdf-4aa6-962f-12ae1bf82d80', false);
    await auth.initTokens();
    //res.send(auth.showTokens());

    switch (testQuery) {
        case "DR": {
            let DR = new ObeliskDataRetrievalOperations('cot.airquality', auth, true);
            let results = await DR.GetEvents('airquality.no2', ['u155kr', 'u155ks'], 1514799902820, 1514799909820);
            //let results = await DR.GetEvents('airquality.no2', ['u155kr', 'u155ks']);
            //let results = await DR.GetEventsLatest('airquality.no2', ['u155kr', 'u155ks']);
            //let results = await DR.GetStats('airquality.no2', ['u155kr', 'u155ks']);
            res.send(results);
            break;
        }
        case "Meta": {
            ////Metadata queries - test
            let Qapi = new ObeliskQueryMetadata('cot.airquality', auth);
            let results = await Qapi.GetMetrics();
            //results = await Qapi.GetThings();
            res.send(results);
        }
        case "Spatial": {
            let SQ = new ObeliskQuerySpatial('cot.airquality', auth,false);

            let results: ObeliskSpatialQueryCodeAndResults = await SQ.GetRawEventsDateFromTo('airquality.no2', 'u155k', '20190521');
            //let results: ObeliskSpatialQueryCodeAndResults = await SQ.GetRawEventsFromTo('airquality.no2', 'u155kr', 1514799902820, 1514799909820);
           
            //await new Promise(resolve => setTimeout(resolve, 3000));
            res.send(results);
        }

    }
});

export default router;