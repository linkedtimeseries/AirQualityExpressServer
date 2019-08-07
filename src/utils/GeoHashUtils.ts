// utility class to calculate the geohashes (http://www.bigfastblog.com/geohash-intro)
// from a tile(https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames)
//  step 1 - convert tile to bounding box (by means of global-mercator package)
//  step 2 - calculate the geohashes belonging to a bounding box (by means of ngeohash package)
//  The number of geohashes returned depends on the precision of the hashstring,
//  in order to reduce the number of hashes the function will change
//  the precision to have between 1 and 10 hashstrings as outcome.
// An additional function is provided to test wheter a geohash is within the Tile.

import globalMercator = require("global-mercator");
import geohash = require("ngeohash");
import ITile from "./ITile";

export interface IBoundingBox {
    minLat: number;
    minLon: number;
    maxLat: number;
    maxLon: number;
}

export default class GeoHashUtils {
    private bbox: IBoundingBox;

    constructor(private tile: ITile) {
        const bb = globalMercator.googleToBBox([tile.x, tile.y, tile.zoom]);
        this.bbox = { minLat: bb[1], minLon: bb[0], maxLat: bb[3], maxLon: bb[2] };
    }

    public getGeoHashes(precision: number = 7): string[] {
        let stop: boolean = false;

        let down = false;
        let ha: string[];
        while (!stop) {
            ha = geohash.bboxes(
                this.bbox.minLat,
                this.bbox.minLon,
                this.bbox.maxLat,
                this.bbox.maxLon,
                precision,
            );
            stop = true;
            if ((ha.length === 1) && down) {
                stop = true;
                precision++;
                down = false;
            }
            if (ha.length > 10) {
                stop = false;
                precision--;
                down = true;
            }
        }
        return ha;
    }

    public isWithinTile(geoHash: string): boolean {
        const ll = geohash.decode(geoHash);
        if ((ll.latitude >= this.bbox.minLat) &&
            (ll.latitude <= this.bbox.maxLat) &&
            (ll.longitude >= this.bbox.minLon) &&
            (ll.longitude <= this.bbox.maxLon)
        ) {
            return true;
        } else {
            return false;
        }
    }
}
