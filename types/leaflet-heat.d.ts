declare module 'leaflet.heat' {
  import * as L from 'leaflet';
  namespace heatLayer {
    interface HeatLatLngTuple extends L.LatLngTuple {
      // heat plugin supports value at index 2; optional
      2?: number;
    }
    interface HeatLayerOptions {
      minOpacity?: number;
      maxZoom?: number;
      radius?: number;
      blur?: number;
      max?: number;
      gradient?: { [key: number]: string };
    }
  }
  export function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: heatLayer.HeatLayerOptions
  ): L.Layer;
}

declare module 'leaflet.heat/dist/leaflet-heat.js' {
  export * from 'leaflet.heat';
}

