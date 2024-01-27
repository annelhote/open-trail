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
