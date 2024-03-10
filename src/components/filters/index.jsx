import { Box, Checkbox, FormControlLabel, Grid, TextField } from '@mui/material';

import { capitalize } from '../../utils';

const Filters = ({ filters, markers, meta, onChange, selectedFilters, setMeta }) => {
  return (
    <Grid className="filters" container item xs={12}>
      {Object.keys(filters).map((category) => (
        <Grid item key={category} xs={12} md={3}>
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
        </Grid>
      ))}

      <Grid item xs={12} sm={3}>
        <Box
          autoComplete="off"
          component="form"
          noValidate
          sx={{
            '& .MuiTextField-root': { width: '100%' },
          }}
        >
          <TextField
            id="filled-number"
            label="Kilomètres parcourus par jour (ressentis aka ITRA)"
            onChange={(event) => setMeta({ ...meta, kmPerDay: event.target.value })}
            type="number"
            value={meta.kmPerDay}
            variant="filled"
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default Filters;