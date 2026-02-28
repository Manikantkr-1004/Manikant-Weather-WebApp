
const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
const preferencesData = localStorage.getItem('preferencesData') ? JSON.parse(localStorage.getItem('preferencesData')) : null;

const initalState = {
    name: userData?.name || '',
    email: userData?.email || '',
    profile: userData?.profile || '',
    location: userData?.location || '',
    isLoggedIn: userData ? true : false,
    favouriteCities: preferencesData?.favouriteCities || [],
    tempUnit: preferencesData?.tempUnit || 'C',
};

const userReducer = (state = initalState, action) => {
    switch (action.type) {
        case 'LOGIN_USER':
            localStorage.setItem('userData', JSON.stringify({
                name: action.payload.name,
                email: action.payload.email,
                profile: action.payload.profile,
            }));
            return {
                ...state,
                name: action.payload.name,
                email: action.payload.email,
                profile: action.payload.profile,
                isLoggedIn: true,
            };
        case 'LOGOUT_USER':
            localStorage.removeItem('userData');
            return {
                ...state,
                name: '',
                email: '',
                profile: '',
                isLoggedIn: false,
            };
        case 'SET_LOCATION':
            localStorage.setItem('userData', JSON.stringify({
                ...userData,
                location: action.payload
            }));
            return {
                ...state,
                location: action.payload
            };
        case 'ADD_FAVOURITE_CITY':
            const updatedFavouriteCities = [action.payload, ...state.favouriteCities];
            localStorage.setItem('preferencesData', JSON.stringify({
                ...preferencesData,
                favouriteCities: updatedFavouriteCities,
            }));
            return {
                ...state,
                favouriteCities: [action.payload, ...state.favouriteCities],
            };
        case 'REMOVE_FAVOURITE_CITY':
            const filteredFavouriteCities = state.favouriteCities.filter(city => city !== action.payload);
            localStorage.setItem('preferencesData', JSON.stringify({
                ...preferencesData,
                favouriteCities: filteredFavouriteCities,
            }));
            return {
                ...state,
                favouriteCities: state.favouriteCities.filter(city => city !== action.payload),
            };
        case 'SET_TEMP_UNIT':
            localStorage.setItem('preferencesData', JSON.stringify({
                ...preferencesData,
                tempUnit: action.payload,
            }));
            return {
                ...state,
                tempUnit: action.payload,
            };
        default:
            return state;
    }
};

export default userReducer;