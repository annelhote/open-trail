import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

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
    <TableContainer className='planner' component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a planner table">
        <TableHead>
          <TableRow>
            <TableCell>Jour</TableCell>
            <TableCell>Nom</TableCell>
            <TableCell>Distance</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Latitude</TableCell>
            <TableCell>Longitude</TableCell>
            <TableCell>Téléphone</TableCell>
            <TableCell>Adresse email</TableCell>
            <TableCell>Site internet</TableCell>
            <TableCell>OpenStreetMap lien</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {markers.filter((marker) => selectedFilters.includes(marker.type)).map((marker, index) => (
            <TableRow key={index}>
              <TableCell>{Math.ceil(marker.distance / meta.kmPerDay) === 0 ? 1 : Math.ceil(marker.distance / meta.kmPerDay)}</TableCell>
              <TableCell>{marker.name}</TableCell>
              <TableCell>{marker.distance} km</TableCell>
              <TableCell>{marker.type}</TableCell>
              <TableCell>{marker.lat}</TableCell>
              <TableCell>{marker.lon}</TableCell>
              <TableCell>{marker.phone}</TableCell>
              <TableCell>{marker.email}</TableCell>
              <TableCell>
                <a href={marker.website} target="_blank" rel="noreferrer">
                  {marker.website}
                </a>
              </TableCell>
              <TableCell>
                <a href={`https://www.openstreetmap.org/${marker.osmType}/${marker.id}`} target="_blank" rel="noreferrer">
                  {marker.id}
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Planner;
