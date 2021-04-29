import React from "react";

import utils from "functions/utils/utils";
import store from "reducers/store";

import { popup as popupFn } from "reducers/slices/popupSlice";
import { showModal } from "reducers/slices/topModalSlice";
import { api } from "functions/api";

const dispatch = store.dispatch;

export default {
  changeCurrency: async function (content) {
    if(!utils.getCrncyList().find(x => x.code === content)){
      dispatch(showModal("Error when setting currency."));
      dispatch(popupFn(null))
      return false;
    }

    utils.setCrncy(content)
    window.location.reload(); //TODO better to reload state only, independent of localStorage
    dispatch(showModal("Currency changed!"));
    dispatch(popupFn(null));
  },

  generateCopyToClipboard: function (obj) {
    return (
      <span
        className="text-btn small"
        onClick={() => this.copyToClipboard(obj.link)}
      >
        {" "}
        {obj.text}{" "}
      </span>
    );
  },

  generateHref: function (obj) {
    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={obj.link}
        className="text-btn small"
      >
        {obj.text}
      </a>
    );
  },
  generateLink: function (obj) {
    return (
      <span onClick={() => this.popup(obj.link)} className="text-btn small">
        {obj.text}
      </span>
    );
  },
  copyToClipboard: function (content, text="Address copied to clipboard") {
    utils.copyToClipboard(content);
    dispatch(showModal(text));
  },

  location_spammer: async function (content) {
    if(process.env.NODE_ENV === "production"){
      return null;
    }

    const conf = content.split(",")
    if(!conf || conf.length === 0){
      return null;
    }

    //127.0.0.1:3000/location_spammer/25,51.518766,-0.122058,-0.0102,-0.02407
    //127.0.0.1:3000/location_spammer/25,51.518766,-0.122058,-0.0302,-0.06407
    //127.0.0.1:3000/location_spammer/25,51.521747,-0.092888,-0.0302,-0.06407

    const amount = conf[0] ? parseInt(conf[0]) : 0;

    const MIN_X = conf[1] ? parseFloat(conf[1]) : 51.553;
    const MIN_Y = conf[2] ? parseFloat(conf[2]) : -0.005;
    const DELTA_X = conf[3] ? parseFloat(conf[3]) : -0.102;
    const DELTA_Y = conf[4] ? parseFloat(conf[4]) : -0.2407;
    const MAX_X = MIN_X + DELTA_X; // 51.451
    const MAX_Y = MIN_Y + DELTA_Y; //0.2457;

    const res = await api("affected_create", {
      body: { amount: parseInt(amount) },
    });

    const { affected_ids } = res;

    await api("qr_codes_create", { body: { affected_ids } });

    const affected_ids_arr = affected_ids.split(",")

    function getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
    }

    function getRandomArbitrary(min, max) {
      return Math.random() * (max - min) + min;
    }
    

    const LOCATION_DESCRIPTION = [
      "under the bridge",
      "next to the station",
      "next to sainsburrys",
      "on the park bench",
      "on the right sidewalk",
      "on the left sidewalk",
      "left road",
      "right road",
      "in the park",
    ];

    const APPEARANCE_COLOR = [
      "green",
      "brown",
      "yellow",
      "red",
      "blue",
      "denim",
      "wool",
      "big",
      "leather",
      "blue",
    ];

    const APPEARANCE_ITEM = [
      "hat",
      "long sleeve shirt",
      "shirt",
      "sweater",
      "hoodie",
      "bag",
      "jacket",
      "cap",
    ];

    const NAME = [
      "joe",
      "john",
      "maple",
      "brandon",
      "mark",
      "robin",
      "annette",
      "anna",
      "monty",
      "serena",
      "jules",
      "patrick",
      "severt",
    ];
    
    //TODO Promise.all()
    for (let a_i = 0; a_i < affected_ids_arr.length; a_i++) {
      const a_id = affected_ids_arr[a_i];

      const location_description =
        LOCATION_DESCRIPTION[getRandomInt(LOCATION_DESCRIPTION.length)];

      const x = getRandomArbitrary(MIN_X, MAX_X)
      const y = getRandomArbitrary(MIN_Y, MAX_Y)

      const body = {
        affected_id: a_id,
        location_description,
        x,
        y,
      };
      
      await api("locations_create", {
        body,
      });

      const appearance = APPEARANCE_COLOR[getRandomInt(APPEARANCE_COLOR.length)] + " " + APPEARANCE_ITEM[getRandomInt(APPEARANCE_ITEM.length)] ;
      const name = NAME[getRandomInt(APPEARANCE_COLOR.length)];

      await api("a_edits_create", {
        body: {
          affected_id: a_id,
          appearance: appearance,
          name: name,
        },
      });


    }
  },
};
