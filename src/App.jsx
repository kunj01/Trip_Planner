import React from "react";
import { Switch, Route } from "react-router-dom";
import { Home, HotelsList, MapView, RestaurantsList, AttractionsList, SearchResult } from "./pages";
import { PlaceDetails } from "./pages/templates";
import ItineraryPage from "./pages/ItineraryPage";
import ItineraryViewPage from "./pages/ItineraryViewPage";
import Profile from "./pages/Profile";
import Bookings from "./pages/Bookings";
import Settings from "./pages/Settings";
import { Login, Signup } from "./components/Auth";

const App = () => {
  return (
    <Switch>
      <Route exact path={"/"}>
        <Home />
      </Route>
      <Route exact path={"/login"}>
        <Login />
      </Route>
      <Route exact path={"/signup"}>
        <Signup />
      </Route>
      <Route exact path={"/itinerary"}>
        <ItineraryPage />
      </Route>
      <Route exact path={"/itinerary/view/:id"}>
        <ItineraryViewPage />
      </Route>
      <Route exact path={"/profile"}>
        <Profile />
      </Route>
      <Route exact path={"/bookings"}>
        <Bookings />
      </Route>
      <Route exact path={"/settings"}>
        <Settings />
      </Route>
      <Route path={"/map"}>
        <MapView />
      </Route>
      <Route exact path={"/restaurants"}>
        <RestaurantsList />
      </Route>
      <Route exact path={"/hotels"}>
        <HotelsList />
      </Route>
      <Route exact path={"/attractions"}>
        <AttractionsList />
      </Route>
      <Route path={"/search"}>
        <SearchResult />
      </Route>
      <Route path={"/:type/:id"}>
        <PlaceDetails />
      </Route>
    </Switch>
  )
}

export default App
