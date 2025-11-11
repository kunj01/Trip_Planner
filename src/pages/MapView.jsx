import { useContext } from 'react'
import { Link, useHistory } from "react-router-dom";
import { Header, Map, Sidebar, Filter } from "../components/map"
import { MainContext } from "../context/MainContext"

const MapView = () => {
    // Destructuring all necessary states from the main context
    const { places, coordinates, setCoordinates, setBounds, filteredPlaces } = useContext(MainContext);
    const history = useHistory();

    // Ensure we have coordinates (fallback to default if not set)
    const mapCoordinates = coordinates && coordinates.lat && coordinates.lng 
        ? coordinates 
        : { lat: 40.7128, lng: -74.0060 };

    // Determine which places to show
    const placesToShow = filteredPlaces && filteredPlaces.length > 0 
        ? filteredPlaces 
        : places && places.length > 0 
            ? places 
            : [];

    return ( 
        <div className="w-full h-screen flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Section */}
            <div className="w-full md:w-[35%] lg:w-[23%] h-auto md:h-full overflow-y-auto bg-white border-r border-gray-200 flex-shrink-0"> 
                <div className="w-full text-center sticky top-0 bg-white z-10 border-b border-gray-200 py-2">
                    {/* Close Map View Button */}
                    <button 
                        className="bg-black text-white py-2 px-8 rounded my-2 hover:bg-gray-600 transition ease-in duration-100"
                        onClick={() => history.goBack()}
                    >
                        <p>Close Map View</p>
                    </button>
                    {/* --- */}
                </div>

                {/* Sidebar Component Rendered with filteredPlaces (Determined by place type and rating from filter) if found or all places passed in prop to 'places' */}
                <Sidebar places={placesToShow} />
                {/* --- */}
            </div>
            
            {/* Map Section */}
            <div className="w-full md:w-[65%] lg:w-[77%] h-[50vh] md:h-full relative flex-shrink-0" style={{ height: '100%' }}>
                {/* Map Component with 'setBounds', 'setCoordinates', 'coordinates' and either 'filteredPlaces' or 'places' states passed in as props to component  */}
                <Map 
                    setBounds={setBounds}
                    setCoordinates={setCoordinates}
                    coordinates={mapCoordinates}
                    places={placesToShow}
                />
                {/* --- */}
                
                {/* Map Header Component, with setCoordinate State passed in as props */}
                <Header setCoordinates={setCoordinates} />
                {/* --- */}

                {/* Map Filter Component - renders component to set place type and rating */}
                <Filter />
                {/* --- */}
            </div>
        </div>
     );
}
 
export default MapView;