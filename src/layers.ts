import type { LayerProps } from 'react-map-gl';

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

export const pointLayer: LayerProps = {
  id: 'points',
  type: 'symbol',
  source: 'point',
  layout: {
    'icon-image': '{icon}',
    'icon-size': 1,
  },
  paint: {
    'icon-color': '#27272a',
    'icon-halo-color': '#ffffff',
    'icon-halo-width': 2,
  },
}
