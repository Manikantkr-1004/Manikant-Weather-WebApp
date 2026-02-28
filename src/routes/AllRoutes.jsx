import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import CityDetails from "../pages/CityDetails";

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/city/:cityName" element={<CityDetails />} />
    </Routes>
  );
};

export default AllRoutes;