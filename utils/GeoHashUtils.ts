var globalMercator = require('global-mercator');
var geohash = require('ngeohash');

export interface BoundingBox {
    minLat: number,
    minLon: number,
    maxLat: number,
    maxLon : number
}

export interface Tile {
    x: number;
    y: number;
    zoom: number;
}

export class GeoHashUtils {
    private bbox: BoundingBox;

    constructor(private tile: Tile) {
        let bb = globalMercator.googleToBBox([tile.x, tile.y, tile.zoom]);
        this.bbox = { minLat : bb[1], minLon : bb[0], maxLat : bb[3], maxLon : bb[2] }
    }

    public getBoundingBox(): BoundingBox {
        return this.bbox;
    }

    public getGeoHashes(precision: number = 7): string[] {
        let stop: boolean = false;

        let down = false;
        while (!stop) {
            var ha = geohash.bboxes(this.bbox.minLat, this.bbox.minLon, this.bbox.maxLat, this.bbox.maxLon, precision);
            stop = true;
            if ((ha.length == 1) && down) {
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
        let ll = geohash.decode(geoHash);
        if ((ll.latitude >= this.bbox.minLat) && (ll.latitude <= this.bbox.maxLat) && (ll.longitude >= this.bbox.minLon) && (ll.longitude <= this.bbox.maxLon))
            return true;
        else
            return false;
    }
 }