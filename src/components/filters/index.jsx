import { Box, Checkbox, FormControlLabel, Grid } from '@mui/material';
import { capitalize } from '../../utils';

const Filters = ({ filters, markers, onChange, selectedFilters }) => {
  return (
    <Grid className="filters" container item xs={12}>
      {Object.keys(filters).map((category) => (
        <Grid item key={category} xs={3}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedFilters.includes(category)}
                indeterminate={filters[category].data.some((r)=> selectedFilters.includes(r)) && !filters[category].data.every((r)=> selectedFilters.includes(r))}
                name={category}
                onChange={onChange}
                style={{ color: filters[category].color }}
              />
            }
            label={`${category} (${filters[category].data.length})`}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
            {filters[category].data.sort().map((item, index) => (
              <FormControlLabel
                control={<Checkbox checked={selectedFilters.includes(item)} style={{ color: markers.find((marker) => marker.type === item).color }} />}
                key={`${category}-${index}`}
                label={capitalize(item.replace('_', ' '))}
                name={item}
                onChange={onChange}
              />
            ))}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default Filters;