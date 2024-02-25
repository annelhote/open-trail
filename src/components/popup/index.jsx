import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationPin } from '@fortawesome/free-solid-svg-icons'
import { Marker, Popup } from 'react-map-gl';

const CustomMarker = ({ index, marker, openPopup }) => {
  return (
    <Marker
      longitude={marker.lon}
      latitude={marker.lat}>
      <span className="fa-stack" onClick={() => openPopup(index)}>
        <FontAwesomeIcon icon={faLocationPin} color={marker.color} className="fa-regular fa-stack-2x" />
        <FontAwesomeIcon icon={marker.icon} color="#e4e5e6" className="fa-stack-1x" style={{ position: "absolute", bottom: "5px" }} transform="shrink-4" />
      </span>
    </Marker>
  )
};

const CustomPopup = ({ marker, closePopup }) => {
  return (
    <Popup
      closeButton={true}
      closeOnClick={false}
      latitude={marker.lat}
      longitude={marker.lon}
      onClose={closePopup}
    >
      <div className='popup'>
        <h3>{marker.name}</h3>
        <div>
          <ul>
            {marker?.type && (<li>Type: {marker.type}</li>)}
            {marker?.phone && (<li>Téléphone: {marker.phone}</li>)}
            {marker?.email && (<li>Email: {marker.email}</li>)}
            {marker?.website && (<li>Site internet: {marker.website}</li>)}
          </ul>
        </div>
      </div>

    </Popup>
  )
};

export { CustomMarker, CustomPopup };
