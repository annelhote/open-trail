import { Card, CardContent, Grid, Link } from "@mui/material";

import { getITRADistance } from "../../utils";

const Stage = ({ day, gpx, markers }) => {
  const points = gpx.tracks[0].points;
  const cumulDistances = [0, ...gpx.tracks[0].distance.cumulItra];

  const getClosestMarkersByCategory = ({ category, gpx, point }) => {
    const closestMarkersByCategory = markers
      .filter((marker) => marker.category === category)
      .map((marker) => ({
        ...marker,
        pointDistance: gpx.calcDistanceBetween(point, marker) / 1000,
      }))
      .sort((a, b) => a.pointDistance - b.pointDistance)
      .slice(0, 5);
    return closestMarkersByCategory;
  };

  const startPointDistance = cumulDistances[0] / 1000;
  const endPointDistance = cumulDistances[cumulDistances.length - 1] / 1000;
  const distance = gpx.calculDistance(points).total / 1000;
  const elevation = gpx.calcElevation(points);

  return (
    <>
      <Grid className="stage" item xs={12} key={day}>
        <Card sx={{ minWidth: 275 }}>
          <CardContent>
            <h3 key="day">Jour {day + 1}</h3>
            <div>
              <b>Point de départ:</b> {points[0].lat},{points[0].lon}
            </div>
            <div>
              <b>Point d'arrivée:</b> {points[points.length - 1].lat},{points[points.length - 1].lon}
            </div>
            <div>
              <b>Distance:</b> {distance.toFixed(1)} km
            </div>
            <div>
              <b>Distance ressentie (aka ITRA):</b>{" "}
              {getITRADistance({ distance, elevation: elevation.pos }).toFixed(
                1
              )}{" "}
              km
            </div>
            <div>
              km {startPointDistance.toFixed(1)} -> km{" "}
              {endPointDistance.toFixed(1)}
            </div>
            <div>
              <b>D+:</b> {(elevation?.pos ?? 0).toFixed(0)} m / <b>D-:</b>{" "}
              {elevation.neg.toFixed(0)} m
            </div>
            {day === 0 && (
              <div>
                <b>Supermarchés :</b>
                <ul>
                  {getClosestMarkersByCategory({
                    category: "alimentation",
                    gpx,
                    point: points[points.length - 1],
                  }).map((accomodation, index) => (
                    <li key={`food-${index}`}>
                      <>
                        {accomodation.name ? (
                          <>
                            <Link
                              href={`https://www.openstreetmap.org/${accomodation.osmType}/${accomodation.id}`}
                              target="_blank"
                            >
                              {accomodation.name}
                            </Link>
                            <span> / </span>
                            <span>{accomodation.label}</span>
                            <span> / </span>
                          </>
                        ) : (
                          <>
                            <Link
                              href={`https://www.openstreetmap.org/${accomodation.osmType}/${accomodation.id}`}
                              target="_blank"
                            >
                              {accomodation.label}
                            </Link>
                            <span> / </span>
                          </>
                        )}
                        <span>
                          {accomodation.lat},{accomodation.lon}
                        </span>
                        <span> / </span>
                        <span>{accomodation.pointDistance.toFixed(3)} km</span>
                      </>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <b>Hébergements:</b>
              <ul>
                {getClosestMarkersByCategory({
                  category: "hébergement",
                  gpx,
                  point: points[points.length - 1],
                }).map((accomodation, index) => (
                  <li key={`accomodation-${index}`}>
                    <>
                      {accomodation.name ? (
                        <>
                          <Link
                            href={`https://www.openstreetmap.org/${accomodation.osmType}/${accomodation.id}`}
                            target="_blank"
                          >
                            {accomodation.name}
                          </Link>
                          <span> / </span>
                          <span>{accomodation.label}</span>
                          <span> / </span>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`https://www.openstreetmap.org/${accomodation.osmType}/${accomodation.id}`}
                            target="_blank"
                          >
                            {accomodation.label}
                          </Link>
                          <span> / </span>
                        </>
                      )}
                      <span>
                        {accomodation.lat},{accomodation.lon}
                      </span>
                      <span> / </span>
                      <span>{accomodation.pointDistance.toFixed(3)} km</span>
                    </>
                  </li>
                ))}
              </ul>
            </div>
            {(day + 1) % 4 === 0 && day !== 0 && (
              <div>
                <b>Supermarchés :</b>
                <ul>
                  {getClosestMarkersByCategory({
                    category: "alimentation",
                    gpx,
                    point: points[0],
                  }).map((accomodation, index) => (
                    <li key={`food-${index}`}>
                      <>
                        {accomodation.name ? (
                          <>
                            <Link
                              href={`https://www.openstreetmap.org/${accomodation.osmType}/${accomodation.id}`}
                              target="_blank"
                            >
                              {accomodation.name}
                            </Link>
                            <span> / </span>
                            <span>{accomodation.label}</span>
                            <span> / </span>
                          </>
                        ) : (
                          <>
                            <Link
                              href={`https://www.openstreetmap.org/${accomodation.osmType}/${accomodation.id}`}
                              target="_blank"
                            >
                              {accomodation.label}
                            </Link>
                            <span> / </span>
                          </>
                        )}
                        <span>
                          {accomodation.lat},{accomodation.lon}
                        </span>
                        <span> / </span>
                        <span>{accomodation.pointDistance.toFixed(3)} km</span>
                      </>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};

export default Stage;
