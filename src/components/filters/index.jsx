import { Box, Checkbox, FormControlLabel, Grid, TextField } from '@mui/material';

import { capitalize } from '../../utils';

const Filters = ({ filters, markers, meta, onChange, selectedFilters, setMeta }) => {
  return (
    <Grid className="filters" container item xs={12}>
      {Object.keys(filters).map((category) => (
        <Grid item key={category} xs={3}>
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

      <Grid item xs={3}>
        <Box
          component="form"
          sx={{
            '& .MuiTextField-root': { m: 1, width: '25ch' },
          }}
          noValidate
          autoComplete="off"
        >
          <TextField
            id="filled-number"
            InputLabelProps={{
              shrink: true,
            }}
            label="Number"
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