"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globalMercator = require('global-mercator');
var geohash = require('ngeohash');
class GeoHashUtils {
    constructor(tile) {
        this.tile = tile;
        let bb = globalMercator.googleToBBox([tile.x, tile.y, tile.zoom]);
        this.bbox = { minLat: bb[1], minLon: bb[0], maxLat: bb[3], maxLon: bb[2] };
    }
    getBoundingBox() {
        return this.bbox;
    }
    getGeoHashes(precision = 7) {
        let stop = false;
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
    isWithinTile(geoHash) {
        let ll = geohash.decode(geoHash);
        if ((ll.latitude >= this.bbox.minLat) && (ll.latitude <= this.bbox.maxLat) && (ll.longitude >= this.bbox.minLon) && (ll.longitude <= this.bbox.maxLon))
            return true;
        else
            return false;
    }
}
exports.GeoHashUtils = GeoHashUtils;
//# sourceMappingURL=GeoHashUtils.js.map