import POPUP from "constants/Popup.constants";

import { api } from "functions/api";
import utils from "functions/utils/utils";

import store from "reducers/store";
import {
  popup,
  updatePopupContent,
  addPopupContent,
  refetchPopupContent,
} from "reducers/slices/popupSlice";

import { updateData } from "reducers/slices/dataSlice";
import { updateAffectedData } from "reducers/slices/affectedDataSlice";
import { addHomeViewData } from "reducers/slices/homeViewDataSlice";

const dispatch = store.dispatch;

export default {
  getUsersMemberState: function (captcha = null) {
    if (utils.getCachedUsersId()){
     this.fetchToViewUsersData(null, captcha);
    }
  },

  fetchToHomeViewDataPlatformInfo: async function (captcha = null) {
    const platformInfo = await api("qr_codes_get_platform_count", {
      body: {
        captcha,
      },
    });

    if (platformInfo && !platformInfo.error)
      dispatch(addHomeViewData({ platformInfo }));
  },

  fetchToHomeViewData: async function (x, y, zoomLevel, map, captcha = null) {
    let distance = (60000 / (2 ^ zoomLevel)) * 2;

    if (map) {
      map = map.target;

      // Get the y,x dimensions of the map
      const yMap = map.getSize().y;
      const xMap = map.getSize().x;
      // calculate the distance the one side of the map to the other using the haversine formula
      var maxMeters = map
        .containerPointToLatLng([0, yMap])
        .distanceTo(map.containerPointToLatLng([xMap, yMap]));
      // calculate how many meters each pixel represents
      var MeterPerPixel = maxMeters / xMap;
      // say this is your scale
      //var scale = L.control.scale().addTo(map)
      //const dist = MeterPerPixel*scale.options.maxWidth
      // This is the scale denominator

      distance = (MeterPerPixel * xMap) / 2; //TODO i.e. 1.5, correct formular
    }
    let affected_locations, affected_locations_usermatched;

    const users_id = utils.getCachedUsersId();
    
    if (users_id){
      affected_locations_usermatched = await api(
        "locations_get_all_for_city_usermatched",
        {
          body: {
            users_id,
            x,
            y,
            distance,
          },
          captcha,
        }
      );
    }

    affected_locations = await api("locations_get_all_for_city", {
      body: {
        x,
        y,
        distance,
      },
      captcha,
    });

    if (affected_locations && !affected_locations.error) {
      affected_locations = affected_locations.map((location) => {
        const affected_locations_usermatched_el = !affected_locations_usermatched
          ? null
          : affected_locations_usermatched.find(
              (x) => x.affected_id === location.affected_id
            );
        return {
          ...location,
          user_spent: affected_locations_usermatched_el
            ? affected_locations_usermatched_el.curr_fiat_amount
            : null,
          campaign: utils.seperateCampaignData(location), //TODO campaigns yet to implement
        };
      });

      dispatch(addHomeViewData({ affected_locations }));
    }
  },

  fetchToHomeViewDataSingle: function (id, captcha = null) {
    const state = store.getState();

    const isMember = utils.isMember(state.accountViewData);

    if (id) {
      //this.fetchToCacheLocations("locations_get_all", id);
      if (isMember) {
        /*this.fetchToPopupAffectedContent(
          state.accountViewData,
          "a_affected_get_balance",
          id,
          "affected_balance"
        );*/
      }
      /*this.fetchToPopupAffectedContent(
        { affected_id: id, curr_public_key: null },
        "affected_get_data_package",
        id
      );*/
    }

    dispatch(updatePopupContent({ affected_id: id }));
    dispatch(popup(POPUP.HOME_MAP_AFFECTED_INFO));
  },

  handleScan: async function (result, fullUrl, captcha = null) {
    /* 1. qr code recognized */

    if (!utils.checkQrCodeUrl(result, fullUrl)) {
      return this.error({ error: "QR code not a donation code" });
    }

    dispatch(popup(POPUP.QR_RECOGNIZED));
    dispatch(updateData({ qr_code: result }));
    dispatch(addPopupContent({ affected_id: null }));
    dispatch(addHomeViewData({ readerActive: false }));

    /* 2. get public_key and affected data if connected to the internet */
    let res, res2;
    res = await api("affected_public_key_from_qr", {
      body: { qr_code: result },
      captcha,
    });

    const { affected_id } = res;

    dispatch(addPopupContent({ affected_id }));

    //TODO let datafusion do this fetching
    res2 = await api("affected_get_data_package", {
      body: { affected_ids: res.affected_id },
      captcha,
    });
    res2 = res2[0];

    // (if not aborted by the user yet)
    dispatch(
      updateData({
        campaign: res2.campaign_id ? utils.seperateCampaignData(res2) : null,
      })
    );
    dispatch(updateAffectedData([res2]));

    dispatch(refetchPopupContent());
  },
};
