import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCartShopping,
  faCoffee,
  faFaucetDrip,
  faHouse,
  faLocationPin,
  faQuestion,
  faRestroom,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons'
import { Marker, Popup } from 'react-map-gl';

const getMarkerFromType = (type) => {
  let color = '#e4e5e6'
  let icon = faQuestion;
  switch (type) {
    case 'alpine_hut':
    case 'apartment':
    case 'camp_site':
    case 'chalet':
    case 'guest_house':
    case 'hostel':
    case 'hotel':
    case 'motel':
    case 'shelter':
    case 'wilderness_hut':
      color = '#f2df16';
      icon = faHouse;
      break;
    case 'cafe':
      color = '#996600';
      icon = faCoffee;
      break;
    case 'deli':
    case 'department_store':
    case 'food':
    case 'general':
    case 'mall':
    case 'supermarket':
      color = '#006633';
      icon = faCartShopping;
      break;
    case 'drinking_water':
    case 'water_point':
      color = '#0099ff';
      icon = faFaucetDrip;
      break;
    case 'restaurant':
      color = '#f21629';
      icon = faUtensils;
      break;
    case 'toilets':
      color = '#f3802e';
      icon = faRestroom;
      break;
    default:
      break;
  }
  return { color, icon };
}

const CustomMarker = ({ index, marker, openPopup }) => {
  return (
    <Marker
      longitude={marker.lon}
      latitude={marker.lat}>
      <span className="fa-stack fa-2x" onClick={() => openPopup(index)}>
        <FontAwesomeIcon icon={faLocationPin} color={getMarkerFromType(marker.type).color} className="fa-regular fa-stack-2x" />
        <FontAwesomeIcon icon={getMarkerFromType(marker.type).icon} color="#e4e5e6" className="fa-stack-1x" style={{ position: "absolute", bottom: "15px" }} transform="shrink-4" />
      </span>
    </Marker>
  )
};

const CustomPopup = ({ index, marker, closePopup }) => {
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
            {marker?.type && (<li>{marker.type}</li>)}
            {marker?.phone && (<li>{marker.phone}</li>)}
            {marker?.email && (<li>{marker.email}</li>)}
            {marker?.website && (<li>{marker.website}</li>)}
          </ul>
        </div>
      </div>

    </Popup>
  )
};

export { CustomMarker, CustomPopup };
