import { Box, Checkbox, FormControlLabel, Grid2 } from '@mui/material';

import { capitalize } from '../../utils';

const Filters = ({ filters, markers, onChange, selectedFilters }) => {
  return (
    <Grid2 className="filters" container size={{ xs: 12 }}>
      {Object.keys(filters).map((category) => (
        <Grid2 key={category} size={{ xs: 12, md: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedFilters.includes(category)}
                indeterminate={filters[category].data.some((r) => selectedFilters.includes(r)) && !filters[category].data.every((r) => selectedFilters.includes(r))}
                name={category}
                onChange={onChange}
                style={{ color: filters[category].color }}
              />
            }
            label={`${capitalize(category)} (${filters[category].data.length})`}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
            {filters[category].data.sort().map((item, index) => (
              <FormControlLabel
                control={<Checkbox checked={selectedFilters.includes(item)} style={{ color: markers.find((marker) => marker.type === item).color }} />}
                key={`${category}-${index}`}
                label={capitalize(markers.find((marker) => marker.type === item).label)}
                name={item}
                onChange={onChange}
              />
            ))}
          </Box>
        </Grid2>
      ))}
    </Grid2>
  );
};

export default Filters;