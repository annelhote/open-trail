const Planner = ({ gpx, markers }) => {
  return (
    <div className='planner'>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Type</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Téléphone</th>
            <th>Adresse email</th>
            <th>Site internet</th>
          </tr>
        </thead>
        <tbody>
          {markers.map((marker) => (
            <tr>
              <td>{marker.name}</td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Planner;
