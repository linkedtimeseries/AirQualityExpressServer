// Interfaces to describe the Obelisk query output
// (IObeliskSpatialQueryResults and IObeliskMetadataMetricsQueryResults).
// IxxxCodeAndResults adds the response code to the output.

export interface IObeliskSpatialQueryResults {
    columns: string[];
    values: Array<Array<(string | number)>>;
}

export interface IObeliskSpatialQueryCodeAndResults {
    responseCode: number;
    results: IObeliskSpatialQueryResults;
}

export interface IObeliskMetadataMetricsQueryResults {
    id: string;
    description: string;
}

export interface IObeliskMetadataMetricsQueryCodeAndResults {
    responseCode: number;
    results: IObeliskMetadataMetricsQueryResults[];
}
