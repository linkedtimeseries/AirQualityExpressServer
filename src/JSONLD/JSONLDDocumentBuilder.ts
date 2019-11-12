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

    public buildTile(tile: ITile, page: Date, aggrMethod?: string, aggrPeriod?: string): object {
        return Object.assign({}, this.buildTilesInfo(tile, page, aggrMethod, aggrPeriod), this.buildDctermsInfo());
    }

    private buildTileURI(tile: ITile, page: Date, aggrMethod?: string, aggrPeriod?: string) {
        let url = `${JSONLDConfig.openObeliskAddress}/data/${tile.zoom}/${tile.x}/${tile.y}?page=${page.toISOString()}`;
        if (aggrMethod) {
            url += `&aggrMethod=${aggrMethod}`;
        }
        if (aggrPeriod) {
            url += `&aggrPeriod=${aggrPeriod}`;
        }
        return url;
    }

    private buildTilesInfo(tile: ITile, page: Date, aggrMethod?: string, aggrPeriod?: string): object {
        const previousPage = new Date(page.getTime() - AirQualityServerConfig.dateTimeFrame);
        const nextPage = new Date(page.getTime() + AirQualityServerConfig.dateTimeFrame);

        const result = {
            "@id": this.buildTileURI(tile, page, aggrMethod, aggrPeriod),
            "tiles:zoom": tile.zoom,
            "tiles:longitudeTile": tile.x,
            "tiles:latitudeTile": tile.y,
            "startDate": page.toISOString(),
            "endDate": nextPage.toISOString(),
            "previous": this.buildTileURI(tile, previousPage, aggrMethod, aggrPeriod),
            "next": undefined,
        };

        if (nextPage < new Date()) {
            result.next = this.buildTileURI(tile, nextPage, aggrMethod, aggrPeriod);
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
            }, {
                "@type": "hydra:IriTemplateMapping",
                "hydra:variable": "aggrMethod",
                "hydra:property": "dcterms:accrualMethod",
                "hydra:required": false,
            }, {
                "@type": "hydra:IriTemplateMapping",
                "hydra:variable": "aggrPeriod",
                "hydra:property": "dcterms:accrualPeriodicity",
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
                    "hydra:template":
                        `${JSONLDConfig.openObeliskAddress}/data/14/{x}/{y}{?page,aggrMethod,aggrPeriod}`,
                    "hydra:variableRepresentation": "hydra:BasicRepresentation",
                    "hydra:mapping": this.buildHydraMapping(),
                },
            },
        };
    }
}
