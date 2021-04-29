import React, { useState } from "react";

import POPUP from "constants/Popup.constants";

import { Map as LeafletMap, TileLayer, Marker } from "react-leaflet";

import FlatSwitcher from "components/dumb/FlatSwitcher";

import utils from "functions/utils/utils";

export default (props) => {
  const locations = props.locations || []; //[{x: 52.23, y: 2.23}];
  const locationsLength = locations.length;

  const [locationsIndex, setLocationsIndex] = useState(0);

  const location = locations.length === 0 ? null : locations[locationsIndex];
  const position =
    location && location.x && location.y ? [location.x, location.y] : null;

  var locationdate = utils.formatDate(location, "created_at");

  if (!props.caller || props.caller !== POPUP.WITHDRAWAL_VIEW) {
    if (locationsIndex === 0) locationdate = "current";
    else if (locationsIndex === 1) locationdate = "previous";
  }

  const switchLocation = (dir) =>
    setLocationsIndex(utils.mod(locationsIndex - dir, locationsLength));

  return (
    <div className="affected-location-history">
      {locations && locationsLength > 0 ? (
        <div>
          <div className="center">
            <b>
              {props.affectedData.name
                ? props.affectedData.name + "'s "
                : "Beneficiary's "}
              location
            </b>
          </div>

          <FlatSwitcher
            pn={locationdate}
            lastIndex={locationsIndex === 0}
            dataLength={locationsLength}
            onChange={(dir) => switchLocation(dir)}
          />
          <div className="center mb-25">
            {location.location_description ? (
              location.location_description
            ) : (
              <i>No details</i>
            )}
          </div>

          {position ? (
            <div className="map-container">
              <LeafletMap center={position} zoom={utils.ZOOM_START}>
                <TileLayer
                  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}></Marker>
              </LeafletMap>
            </div>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};
