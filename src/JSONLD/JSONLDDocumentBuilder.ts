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

    public build(tile: ITile, page: Date): object {
        return Object.assign({}, this.buildTilesInfo(tile, page), this.buildDctermsInfo());
    }

    private buildURI(tile: ITile, page: Date) {
        return `${JSONLDConfig.openObeliskAddress}/data/${tile.zoom}/${tile.x}/${tile.y}?page=${page.toISOString()}`;
    }

    private buildTilesInfo(tile: ITile, page: Date): object {
        const previousPage = new Date(page.getTime() - AirQualityServerConfig.dateTimeFrame);
        const nextPage = new Date(page.getTime() + AirQualityServerConfig.dateTimeFrame);

        const result = {
            "@id": this.buildURI(tile, page),
            "tiles:zoom": tile.zoom,
            "tiles:longitudeTile": tile.x,
            "tiles:latitudeTile": tile.y,
            "startDate": page.toISOString(),
            "endDate": nextPage.toISOString(),
            "previous": this.buildURI(tile, previousPage),
            "next": undefined,
        };

        if (nextPage < new Date()) {
            result.next = this.buildURI(tile, nextPage);
        }

        return result;
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
                "hydra:property": "dcterms:date",
                "hydra:required": false,
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
