// Build the document information for the request in JSONLD format.
//  step 1 - add the Tiles Info
//  step 2 - add the DctermsInfo

import AirQualityServerConfig from "../AirQualityServerConfig";
import ITile from "../utils/ITile";
import JSONLDConfig from "./JSONLDConfig";

export default class JSONLDDocumentBuilder {
    private airQualityServerConfig;

    constructor() {
        this.airQualityServerConfig = new AirQualityServerConfig();
    }

    public build(tile: ITile, observationTimeQuery: string): object {
        return Object.assign({}, this.buildTilesInfo(tile, observationTimeQuery), this.buildDctermsInfo());
    }

    private buildTilesInfo(tile: ITile, observationTimeQuery: string): object {
        return {
            "@id": `${JSONLDConfig.openObeliskAddress}/data/${tile.zoom}/` +
                `${tile.x}/${tile.y}?page=${observationTimeQuery}`,
            "tiles:zoom": tile.zoom,
            "tiles:longitudeTile": tile.x,
            "tiles:latitudeTile": tile.y,
            "ts:observationTimeQuery": observationTimeQuery,
        };
    }

    private buildHydraMapping(): object {
        return [
            {
                "@type": "hydra:IriTemplateMapping",
                "hydra:variable": "x",
                "hydra:property": "tiles:longitudeTile",
                "hydra:required": true,
            }, {
                "@type": "hydra:IriTemplateMapping",
                "hydra:variable": "y",
                "hydra:property": "tiles:latitudeTile",
                "hydra:required": true,
            }, {
                "@type": "hydra:IriTemplateMapping",
                "hydra:variable": "page",
                "hydra:property": "ts:observationTimeQuery",
                "hydra:required": true,
            },
        ];
    }

    private buildDctermsInfo(): object {
        return {
            "dcterms:isPartOf": {
                "@id": JSONLDConfig.openObeliskAddress,
                "@type": "hydra:Collection",
                "dcterms:license": this.airQualityServerConfig.dcterms_license,
                "dcterms:rights": this.airQualityServerConfig.dcterms_rights,
                "hydra:search": {
                    "@type": "hydraIriTemplate",
                    "hydra:template": `${JSONLDConfig.openObeliskAddress}/data/14/x/y{?page}`,
                    "hydra:variableRepresentation": "hydra:BasicRepresentation",
                    "hydra:mapping": this.buildHydraMapping(),
                },
            },
        };
    }
}
