/*
 * GET home page.
 */
//This route is only used to do some testing !
import express = require('express');
import { ObeliskClientAuthentication } from '../utils/Authentication';
import { ObeliskQueryMetadata } from '../ObeliskQuery/OQMetadata';
import { IObeliskMetadataMetricsQueryCodeAndResults } from '../ObeliskQuery/ObeliskQueryInterfaces';
import { ObeliskDataRetrievalOperations } from '../ObeliskQuery/ODataRetrievalOperations';
import { AirQualityServerConfig } from '../AirQualityServerConfig';
const router = express.Router();

router.get('/', async function (req, res) {

    //let testQuery: string = "DR";
    let testQuery: string = "Meta";
    //let testQuery: string = "Spatial";
    let airQualityServerConfig = new AirQualityServerConfig();

    let auth = new ObeliskClientAuthentication(airQualityServerConfig.ObeliskClientId, airQualityServerConfig.ObeliskClientSecret, false);
    await auth.initTokens();
    //res.send(auth.showTokens());

    switch (testQuery) {
        case "DR": {
            let DR = new ObeliskDataRetrievalOperations(AirQualityServerConfig.scopeId, auth, true);
            let results = await DR.getEvents('airquality.no2', ['u155kr', 'u155ks'], 1514799902820, 1514799909820);
            //let results = await DR.GetEvents('airquality.no2', ['u155kr', 'u155ks']);
            //let results = await DR.GetEventsLatest('airquality.no2', ['u155kr', 'u155ks']);
            //let results = await DR.GetStats('airquality.no2', ['u155kr', 'u155ks']);
            res.send(results);
            break;
        }
        case "Meta": {
            ////Metadata queries - test
            let Qapi = new ObeliskQueryMetadata(AirQualityServerConfig.scopeId, auth, true);
            let results: IObeliskMetadataMetricsQueryCodeAndResults = await Qapi.getMetrics();
            //for (let x of results.results) {
            //    console.log("x:", x.id);
            //}
            res.send(results);
            break;
        }        
    }
});

export default router;