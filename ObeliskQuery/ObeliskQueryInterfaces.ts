export interface ObeliskSpatialQueryResults {
    columns: string[],
    values : (string|number)[][]
}
export interface ObeliskSpatialQueryCodeAndResults {
    responseCode: number,
    results: ObeliskSpatialQueryResults
}

export interface ObeliskMetadataMetricsQueryResults {
    id: string,
    description: string
}
export interface ObeliskMetadataMetricsQueryCodeAndResults {
    responseCode: number,
    results: ObeliskMetadataMetricsQueryResults[]
}

export interface ObeliskMetadataThingsQueryResults {
    id: string,
    displayName: string
}
export interface ObeliskMetadataThingsQueryCodeAndResults {
    responseCode: number,
    results: ObeliskMetadataThingsQueryResults[]
}