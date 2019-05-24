/*
 * GET home page.
 */
import express = require('express');
import { ObeliskClientAuthentication } from '../utils/Authentication';
import { ObeliskQueryMetadata } from '../ObeliskQuery/OQMetadata';
import { ObeliskQuerySpatial } from '../ObeliskQuery/OQSpatial';
import { ObeliskSpatialQueryCodeAndResults } from '../ObeliskQuery/ObeliskQueryInterfaces';
const router = express.Router();

router.get('/',async function (req, res) {
    //res.redirect('/data');
    let auth = new ObeliskClientAuthentication('smart-flanders-linked-air-quality', '87bf0a72-bbdf-4aa6-962f-12ae1bf82d80');
    await auth.initTokens();
   
    let SQ = new ObeliskQuerySpatial('cot.airquality', auth,false);
    //let status : number;
    //let results: any;
    ////[status,results]=await SQ.GetRawEventsFromTo('airquality.no2', 'u155k', 1514799902820, 1514799909820);

    //let results: ObeliskSpatialQueryCodeAndResults = await SQ.GetRawEventsDateFromTo('airquality.no2', 'u155k', '20190521');
    let results: ObeliskSpatialQueryCodeAndResults = await SQ.GetRawEventsFromTo('airquality.no2', 'u155k', 1514799902820, 1514799909820);

    ////[status, results] = await SQ.GetRawEventsDateFromTo('airquality.no2', 'u155k', '20190521');
    //await new Promise(resolve => setTimeout(resolve, 3000));
    //[status, results] = await SQ.GetRawEventsDateFromTo('airquality.no2', 'u155k', '20190521');


    ////Metadata queries - test

    //let Qapi = new ObeliskQueryMetadata('cot.airquality', auth);
    //[status, results] = await Qapi.GetMetrics();
    //[status, results] = await Qapi.GetThings();
    //let results = await Qapi.GetMetrics();
    //let results = await Qapi.GetThings();
    //res.send(auth.showTokens());
    //res.send([status, results]);

    res.send(results);
});

export default router;