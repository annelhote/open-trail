import type { CircleLayer, LayerProps } from 'react-map-gl';

export const lineLayer: LayerProps = {
  id: 'LineString',
  type: 'line',
  source: 'LineString',
  layout: {
    'line-join': 'round',
    'line-cap': 'round'
  },
  paint: {
    'line-color': '#10a4e5',
    'line-width': 3
  }
}

export const circleLayer: CircleLayer = {
  id: 'Cirlce',
  type: 'circle',
  source: 'Circle',
  paint: {
    'circle-stroke-color': '#000',
    'circle-stroke-width': 1,
    'circle-color': '#000'
  }
}
