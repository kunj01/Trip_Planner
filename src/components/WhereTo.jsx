import { useState, useContext } from "react";
import wheretoImg from '../img/whereto.webp';
import { useHistory } from "react-router-dom";
import { MainContext } from "../context/MainContext";
import PlaceSearchModal from "./PlaceSearchModal";

const WhereTo = () => {
    const [term, setTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const history = useHistory();
    const { setSearchedLocation } = useContext(MainContext);

    // Form submit handler function - fires on submit
    const handleSubmit = (e) => {
        // Prevent form from reloading page
        e.preventDefault();

        const trimmedTerm = term.trim();
        if (trimmedTerm) {
            // Update term to trimmed version
            setTerm(trimmedTerm);
            // Show modal with place details
            setShowModal(true);
        }
    }

    const handleSelectLocation = (location) => {
        // Store the searched location in context
        setSearchedLocation(location);
        // Route to the search Result page
        history.push(`/search?location=${location.name}`);
    }

    return ( 
        <div className="container mx-auto p-4 relative flex justify-center items-center">
            <img src={wheretoImg} alt="BG" 
                className="object-cover md:w-full md:h-[22em] h-[20em]" 
            />
            {/* Search Input Field */}
            <div className="absolute w-[85%] md:w-10/12">
                <form className="relative" onSubmit={handleSubmit}>
                    <svg className="h-6 w-6 absolute left-3 top-1/4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Where to?"
                        className="bg-white rounded-full w-full pl-12 py-3 shadow-xl focus:outline-none" 
                        value={term}
                        // Update form state value onChange of input
                        onChange={e => setTerm(e.target.value)}
                    />
                </form>
            </div>
            {/* --- */}

            {/* Place Search Modal */}
            <PlaceSearchModal
                searchTerm={term}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSelectLocation={handleSelectLocation}
            />
        </div>
     );
}
 
export default WhereTo;