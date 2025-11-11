import React from "react";
import { Switch, Route } from "react-router-dom";
import { Home, HotelsList, MapView, RestaurantsList, AttractionsList, SearchResult } from "./pages";
import { PlaceDetails } from "./pages/templates";
import ItineraryPage from "./pages/ItineraryPage";

const App = () => {
  return (
    <Switch>
      <Route exact path={"/"}>
        <Home />
      </Route>
      <Route exact path={"/itinerary"}>
        <ItineraryPage />
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
