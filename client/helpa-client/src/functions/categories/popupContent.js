import { api } from "functions/api";
import utils from "functions/utils/utils";

import store from "reducers/store";

import { refetchPopupContent } from "reducers/slices/popupSlice";

import { updateData } from "reducers/slices/dataSlice";

import {
  updateAffectedData,
  updateAffectedExtended,
  updateAffectedLocations,
} from "reducers/slices/affectedDataSlice";

const dispatch = store.dispatch;

//no error checks for below functions as they represent merely "additional" data

export default {
  
  refetchPopupContent: function () {
    dispatch(refetchPopupContent());
  },

  fetchToAffectedData: async function (id, captcha = null) {
    if (!id) return;

    const contentData = await api("affected_get_data_package", {
      body: { affected_ids: id, affected_id: id, id },
      captcha,
    });

    const content = contentData[0];
    if (content && !content.error) {
      dispatch(updateAffectedData([{ ...content, affected_id: id }]));
    }
  },

  fetchToAffectedDataExtended: async function (id, endpoint = null, captcha = null) {
    if(!id)
      return;

    let contentData, contentDataBalance, contentDataPublicKey;

    if (!endpoint) {
      if (utils.getCachedUsersId()) {
        contentDataBalance = await api("a_affected_get_balance", {
          body: { affected_ids: id, affected_id: id, id, crncy: utils.getCrncy()},
          captcha
        });
      }

      contentDataPublicKey = await api("affected_public_key", {
        body: { affected_ids: id, affected_id: id, id, crncy: utils.getCrncy()},
        captcha
      });
    } else {
      contentData = await api(endpoint, {
        body: {
          affected_ids: id,
          affected_id: id,
          id,
          crncy: utils.getCrncy(),
        },
        captcha,
      });
    }

    if (!endpoint || endpoint === "a_affected_get_balance") {
      const content = contentDataBalance ? contentDataBalance : contentData;

      if (content && !content.error){
        dispatch(
          updateAffectedExtended([
            {
              balance: content.balance,
              fiatBalance: content.fiat_balance,
              crncy: content.crncy,
              affected_id: id,
            },
          ])
        );
      }
    }

    if (!endpoint || endpoint === "affected_public_key") {
      const content = contentDataPublicKey ? contentDataPublicKey : contentData;
      if (content && !content.error){
        dispatch(
          updateAffectedExtended([{ publicKey: content, affected_id: id }])
        );
      }
    }
  },

  fetchToAffectedLocations: async function (id, captcha = null) {
    if(!id)
      return;

    const content = await api("locations_get_all", {
      body: { affected_id: id}, captcha
    });

    if (content && !content.error){
      dispatch(
        updateAffectedLocations([{ locations: content, affected_id: id }])
      );
    }
  },

  fetchCampaignToData: async function (id, captcha = null) {
    if(!id)
      return;
      
    const content = await api("a_campaigns_get", {
      body: { campaigns_id: id}, captcha
    });

    if (content && !content.error && content.length > 0)
      dispatch(updateData({ campaign: content[0] }));
  },
};
