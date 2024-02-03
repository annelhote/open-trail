const Planner = ({ gpx, markers }) => {
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
    <div className='planner'>
      <table>
        <thead>
          <tr>
            <th>Jour</th>
            <th>Nom</th>
            <th>Distance</th>
            <th>Type</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Téléphone</th>
            <th>Adresse email</th>
            <th>Site internet</th>
            <th>OpenStreetMap lien</th>
          </tr>
        </thead>
        <tbody>
          {markers.map((marker) => (
            <tr>
              <td>{Math.ceil(marker.distance / 20) === 0 ? 1 : Math.ceil(marker.distance / 20)}</td>
              <td>{marker.name}</td>
              <td>{marker.distance} km</td>
              <td>{marker.type}</td>
              <td>{marker.lat}</td>
              <td>{marker.lon}</td>
              <td>{marker.phone}</td>
              <td>{marker.email}</td>
              <td>
                <a href={marker.website} target="_blank" rel="noreferrer">
                  {marker.website}
                </a>
              </td>
              <td>
                <a href={`https://www.openstreetmap.org/${marker.osmType}/${marker.id}`} target="_blank" rel="noreferrer">
                  {marker.id}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Planner;
