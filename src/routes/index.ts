/*
 * GET home page.
 */
// This route is only used to do some testing !
import express = require("express");
import AirQualityServerConfig from "../AirQualityServerConfig";
import { IObeliskMetadataMetricsQueryCodeAndResults } from "../ObeliskQuery/ObeliskQueryInterfaces";
import ObeliskDataRetrievalOperations from "../ObeliskQuery/ODataRetrievalOperations";
import ObeliskQueryMetadata from "../ObeliskQuery/OQMetadata";
import ObeliskClientAuthentication from "../utils/Authentication";
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        // let testQuery: string = "DR";
        const testQuery: string = "Meta";
        // let testQuery: string = "Spatial";
        const airQualityServerConfig = new AirQualityServerConfig();

        const auth = new ObeliskClientAuthentication(
            airQualityServerConfig.obeliskClientId,
            airQualityServerConfig.obeliskClientSecret,
            false,
        );

        await auth.initTokens();
        // res.send(auth.showTokens());

        switch (testQuery) {
            case "DR": {
                const DR = new ObeliskDataRetrievalOperations(AirQualityServerConfig.scopeId, auth, true);
                const requestUrl = DR.buildGeoHashUrl("airquality.no2", ["u155kr", "u155ks"]);
                const results = await DR.getEvents("airquality.no2",
                    requestUrl, 1514799902820, 1514799909820);
                // let results = await DR.GetEvents('airquality.no2', ['u155kr', 'u155ks']);
                // let results = await DR.GetEventsLatest('airquality.no2', ['u155kr', 'u155ks']);
                // let results = await DR.GetStats('airquality.no2', ['u155kr', 'u155ks']);
                res.send(results);
                break;
            }
            case "Meta": {
                //// Metadata queries - test
                const Qapi = new ObeliskQueryMetadata(AirQualityServerConfig.scopeId, auth, true);
                const results: IObeliskMetadataMetricsQueryCodeAndResults = await Qapi.getMetrics();
                // for (let x of results.results) {
                //    console.log("x:", x.id);
                // }
                res.send(results);
                break;
            }
        }
    } catch (err) {
        console.error(err);
        res.status(401).send("Unauthorized access: Please provide valid Obelisk"
            + " credentials in the obeliskLogin.json file");
    }
});

export default router;
