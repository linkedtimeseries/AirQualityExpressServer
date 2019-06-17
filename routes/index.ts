/*
 * GET home page.
 */
import express = require('express');
import { ObeliskClientAuthentication } from '../utils/Authentication';
import { ObeliskQueryMetadata } from '../ObeliskQuery/OQMetadata';
import { ObeliskQuerySpatial } from '../ObeliskQuery/OQSpatial';
import { IObeliskSpatialQueryCodeAndResults, IObeliskMetadataMetricsQueryCodeAndResults } from '../ObeliskQuery/ObeliskQueryInterfaces';
import { ObeliskDataRetrievalOperations } from '../ObeliskQuery/ODataRetrievalOperations';
import { AirQualityServerConfig } from '../AirQualityServerConfig';
const router = express.Router();

router.get('/', async function (req, res) {

    //let testQuery: string = "DR";
    let testQuery: string = "Meta";
    //let testQuery: string = "Spatial";

    let auth = new ObeliskClientAuthentication(AirQualityServerConfig.ObeliskClientId, AirQualityServerConfig.ObeliskClientSecret, false);
    await auth.initTokens();
    //res.send(auth.showTokens());

    switch (testQuery) {
        case "DR": {
            let DR = new ObeliskDataRetrievalOperations(AirQualityServerConfig.scopeId, auth, true);
            let results = await DR.GetEvents('airquality.no2', ['u155kr', 'u155ks'], 1514799902820, 1514799909820);
            //let results = await DR.GetEvents('airquality.no2', ['u155kr', 'u155ks']);
            //let results = await DR.GetEventsLatest('airquality.no2', ['u155kr', 'u155ks']);
            //let results = await DR.GetStats('airquality.no2', ['u155kr', 'u155ks']);
            res.send(results);
            break;
        }
        case "Meta": {
            ////Metadata queries - test
            let Qapi = new ObeliskQueryMetadata(AirQualityServerConfig.scopeId, auth, true);
            let results: IObeliskMetadataMetricsQueryCodeAndResults = await Qapi.GetMetrics();
            //for (let x of results.results) {
            //    console.log("x:", x.id);
            //}
            //results = await Qapi.GetThings();
            res.send(results);
            break;
        }
        case "Spatial": {
            let SQ = new ObeliskQuerySpatial(AirQualityServerConfig.scopeId, auth, false);

            let results: IObeliskSpatialQueryCodeAndResults = await SQ.GetRawEventsDateFromTo('airquality.no2', 'u155k', '20190521');
            //let results: ObeliskSpatialQueryCodeAndResults = await SQ.GetRawEventsFromTo('airquality.no2', 'u155kr', 1514799902820, 1514799909820);
           
            //await new Promise(resolve => setTimeout(resolve, 3000));
            res.send(results);
            break;
        }

    }
});

export default router;