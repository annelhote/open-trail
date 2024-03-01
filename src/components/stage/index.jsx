import { Card, CardContent, Grid } from '@mui/material';

import { getClosestPointIndexByDistance, getITRADistance } from '../../utils';

const Stage = ({ day, gpx, markers, meta }) => {
  const points = gpx.tracks[0].points;
  const cumulDistances = [0, ...gpx.calculDistance(points).cumul.slice(0, -1)];

  const getClosestAccomodations = (point) => {
    const accomodations = markers
      .filter((marker) => marker.category === 'hébergement')
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
    return accomodations;
  }
  const startPointIndex = getClosestPointIndexByDistance({ cumulDistances, distance: meta.kmPerDay * 1000 * day });
  const startPoint = points[startPointIndex];
  const startPointDistance = cumulDistances[startPointIndex] / 1000;
  const endPointIndex = getClosestPointIndexByDistance({ cumulDistances, distance: meta.kmPerDay * 1000 * (day + 1) });
  const endPoint = points[endPointIndex];
  const endPointDistance = cumulDistances[endPointIndex] / 1000;
  const distance = gpx.calculDistance(points.slice(startPointIndex, endPointIndex + 1)).total / 1000;
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
              Distance: {distance.toFixed(1)} km
            </div>
            <div>
              Distance ITRA: {getITRADistance({ distance, elevation: elevation.pos }).toFixed(1)} km
            </div>
            <div>
              km {startPointDistance.toFixed(1)} -> km {endPointDistance.toFixed(1)}
            </div>

            <div>
              D+: {elevation.pos.toFixed(0)} m / D-: {elevation.neg.toFixed(0)} m
            </div>
            <div>
              Hébergements :
              <ul>
                {getClosestAccomodations(endPoint).map((accomodation, index) => (
                  <li key={`accomodation-${index}`}>
                    {accomodation.name} / {accomodation.label} / {accomodation.lat},{accomodation.lon} / {accomodation.distance} km
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