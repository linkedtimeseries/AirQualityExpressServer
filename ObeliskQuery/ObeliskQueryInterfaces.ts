export interface IObeliskSpatialQueryResults {
    columns: string[],
    values : (string|number)[][]
}
export interface IObeliskSpatialQueryCodeAndResults {
    responseCode: number,
    results: IObeliskSpatialQueryResults
}

export interface IObeliskMetadataMetricsQueryResults {
    id: string,
    description: string
}
export interface IObeliskMetadataMetricsQueryCodeAndResults {
    responseCode: number,
    results: IObeliskMetadataMetricsQueryResults[]
}

export interface IObeliskMetadataThingsQueryResults {
    id: string,
    displayName: string
}
export interface IObeliskMetadataThingsQueryCodeAndResults {
    responseCode: number,
    results: IObeliskMetadataThingsQueryResults[]
}