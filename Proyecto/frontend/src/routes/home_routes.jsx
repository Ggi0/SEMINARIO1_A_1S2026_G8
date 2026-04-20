import { Route } from "react-router-dom";
import Home from "../pages/home";

export const HomeRoutes = () => {
  return [
    <Route key="home" path="/" element={<Home />} />
  ];
};