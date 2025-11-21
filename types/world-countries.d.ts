declare module "world-countries" {
  export type LngLatTuple = [number, number];

  export interface CountryGeometryPolygon {
    type: "Polygon";
    coordinates: LngLatTuple[][];
  }

  export interface CountryGeometryMultiPolygon {
    type: "MultiPolygon";
    coordinates: LngLatTuple[][][];
  }

  export type CountryGeometry = CountryGeometryPolygon | CountryGeometryMultiPolygon;

  export interface Country {
    cca3: string;
    geometry?: CountryGeometry;
  }

  const countries: Country[];
  export default countries;
}

