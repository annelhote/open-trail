import { Card, CardContent, Grid } from '@mui/material';

const Stage = ({ day, gpx, markers, meta }) => {
  const points = gpx.tracks[0].points;
  const cumulDistances = [0, ...gpx.calculDistance(points).cumul.slice(0, -1)];

  const getClosestPointIndex = (firstDayDistance) => {
    const closestDistance = cumulDistances.reduce(
      (previous, current, index) => Math.abs(firstDayDistance - current) < Math.abs(firstDayDistance - previous.distance) ? { distance: current, index } : previous,
      { distance: gpx.tracks[0].distance.total, index: points.length - 1 }
    );
    return closestDistance.index;
  }

  const getClosestAccomodations = (point) => {
    const accomodations = markers
      .filter((marker) => marker.category === 'hébergement')
      // Distance à vol d'oiseau
      .map((marker) => ({ ...marker, distance: gpx.calcDistanceBetween(marker, point) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
    return accomodations;
  }
  const startPointIndex = getClosestPointIndex(meta.kmPerDay * 1000 * day);
  const startPoint = points[startPointIndex];
  const startPointDistance = (cumulDistances[startPointIndex] / 1000).toFixed(1);
  const endPointIndex = getClosestPointIndex(meta.kmPerDay * 1000 * (day + 1));
  const endPoint = points[endPointIndex];
  const endPointDistance = (cumulDistances[endPointIndex] / 1000).toFixed(1);
  const distance = (gpx.calculDistance(points.slice(startPointIndex, endPointIndex + 1)).total / 1000).toFixed(1);
  const elevation = gpx.calcElevation(points.slice(startPointIndex, endPointIndex + 1));

  return (
    <>
      <Grid className="stage" item xs={12} key={day}>
        <Card sx={{ minWidth: 275 }}>
          <CardContent>
            <div key="day">
              Jour {day + 1}
            </div>
            <div>
              Point de départ: {startPoint.lat},{startPoint.lon}
            </div>
            <div>
              Point d'arrivée: {endPoint.lat},{endPoint.lon}
            </div>
            <div>
              Distance: {distance} km
            </div>
            <div>
              km {startPointDistance} -> km {endPointDistance}
            </div>

            <div>
              D+: {elevation.pos.toFixed(0)} m / D-: {elevation.neg.toFixed(0)} m
            </div>
            <div>
              Hébergements :
              <ul>
                {getClosestAccomodations(endPoint).map((accomodation, index) => (
                  <li key={`accomodation-${index}`}>
                    {accomodation.name} / {accomodation.label} / {accomodation.lat},{accomodation.lon} / {(accomodation.distance / 1000).toFixed(2)} km
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};

export default Stage;