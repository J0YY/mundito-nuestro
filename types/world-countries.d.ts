declare module "world-countries" {
  interface CountryGeometry {
    type: "Polygon" | "MultiPolygon";
    coordinates: any;
  }
  interface Country {
    cca3: string;
    geometry?: CountryGeometry;
  }
  const countries: Country[];
  export default countries;
}

