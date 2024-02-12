import { Grid, Paper, Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import { styled } from '@mui/material/styles';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';

import { capitalize } from '../../utils';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const Planner = ({ gpx, markers, meta, selectedFilters }) => {
  const points = gpx.tracks[0].points;
  const cumulDistances = [0, ...gpx.calculDistance(gpx.tracks[0].points).cumul.slice(0, -1)];
  const data = cumulDistances.map((item, index) => ({ distance: Math.floor(item / 1000), elevation: points[index].ele }));

  markers = markers.map((marker) => {
    const closestPoint = points.reduce(
      (accumulator, currentValue, index) => gpx.calcDistanceBetween(currentValue, marker) < accumulator.distance ? { distance: gpx.calcDistanceBetween(currentValue, marker), point: currentValue, index } : accumulator,
      { distance: gpx.tracks[0].distance.total, point: points[points.length - 1], index: points.length - 1 },
    );
    const redPoint = data[closestPoint.index];
    return { ...marker, distance: redPoint.distance };
  }).sort((a, b) => a.distance - b.distance);

  return (
    <Grid className='planner' container>
      <TableContainer component={Paper}>
        <Table aria-label='a planner table' size='small' style={{ width: '100%' }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>Jour</StyledTableCell>
              <StyledTableCell>Nom</StyledTableCell>
              <StyledTableCell>Distance</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Latitude</StyledTableCell>
              <StyledTableCell>Longitude</StyledTableCell>
              <StyledTableCell>Téléphone</StyledTableCell>
              <StyledTableCell>Adresse email</StyledTableCell>
              <StyledTableCell>Site internet</StyledTableCell>
              <StyledTableCell>Lien OSM</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {markers.filter((marker) => selectedFilters.includes(marker.type)).map((marker, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell>{Math.ceil(marker.distance / meta.kmPerDay) === 0 ? 1 : Math.ceil(marker.distance / meta.kmPerDay)}</StyledTableCell>
                <StyledTableCell>{marker.name}</StyledTableCell>
                <StyledTableCell>km {marker.distance}</StyledTableCell>
                <StyledTableCell>{capitalize(marker.label)}</StyledTableCell>
                <StyledTableCell>{marker.lat}</StyledTableCell>
                <StyledTableCell>{marker.lon}</StyledTableCell>
                <StyledTableCell>{marker?.phone}</StyledTableCell>
                <StyledTableCell>{marker.email}</StyledTableCell>
                <StyledTableCell>
                  <a href={marker.website} target='_blank' rel='noreferrer'>
                    {marker.website}
                  </a>
                </StyledTableCell>
                <StyledTableCell>
                  <a href={`https://www.openstreetmap.org/${marker.osmType}/${marker.id}`} target='_blank' rel='noreferrer'>
                    {marker.id}
                  </a>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
};

export default Planner;
