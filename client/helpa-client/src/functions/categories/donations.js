import POPUP from "constants/Popup.constants";
import PS from "constants/PopupStatus.constants";

import { api } from "functions/api";
import utils from "functions/utils/utils";

import store from "reducers/store";
import {
  popup as popupFn,
  popupPending,
  popupAbort,
} from "reducers/slices/popupSlice";
import { addData } from "reducers/slices/dataSlice";
import { addHomeViewData } from "reducers/slices/homeViewDataSlice";
import { updateAffectedData } from "reducers/slices/affectedDataSlice";

import { showModal } from "reducers/slices/topModalSlice";

const dispatch = store.dispatch;

export default {
  reassignDonation: async function (content, captcha = null) {
    api("a_donations_account_assign", {
      body: {
        secret: content.secret,
      },
      captcha,
    });
  },

  startDonation: function () {
    dispatch(popupPending(true));
    dispatch(popupFn(POPUP.RE_DONATE));
  },

  deleteSaved: async function (id, captcha = null) {
    if (!id) this.error(null);

    const idPost = parseInt(id.replace("saved", ""));
    const res = await api("a_saved_delete", {
      body: {
        id: idPost,
      },
      captcha,
    });

    if (this.error(res)) return false;

    dispatch(popupFn(null));
    dispatch(showModal("Saved deleted"));
  },

  changeInfos: async function (content, captcha = null) {
    let res;

    /* edit */
    if (utils.getCachedUsersId()) {
      res = await api("a_edits_create", {
        body: {
          affected_id: content.affected_id,
          name: content.name,
          appearance: content.appearance,
          story: content.story,
        },
        captcha,
      });

      const dispatchPopups = true;
      const removePrevPopup = false; //false because we have no successive screen loading before the api call
      if (this.error(res, dispatchPopups, removePrevPopup)) return false;

      dispatch(updateAffectedData([content])); //TODO is this the right moment for the affected data update?
      dispatch(showModal("Infos changed"));
    }
  },

  donate: async function (content, captcha = null) {
    dispatch(
      addData({
        secrets: { donationSecret: null },
      })
    );
    dispatch(popupPending(true));
    dispatch(popupFn(POPUP.DONATION_FINISHED));

    if (!content.affected_id) {
      this.error({ error: "Beneficiary not found" });
      dispatch(popupPending(false));
      return false;
    }

    let saved = {};
    if (utils.getCachedUsersId()) {
      saved = await api("a_saved_create", {
        body: { affected_id: content.affected_id },
        captcha,
      });
    } else {
      saved = await api("saved_create", {
        body: { affected_id: content.affected_id },
        captcha,
      });
    }
    if (this.error(saved)) {
      return false;
    }
    dispatch(
      addData({
        secrets: { donationSecret: saved.secret },
      })
    );

    let res;

    /* 1. create edit */

    if (content.appearance || content.name) {
      if (utils.getCachedUsersId()) {
        const resEdits = await api("a_edits_create", {
          body: {
            affected_id: content.affected_id,
            appearance: content.appearance,
            name: content.name,
          },
          captcha,
        });

        if (this.error(resEdits)) return false;
      }
    }

    /* 2. create location */

    const gps = await content.gps;
    let x, y;

    if (gps) {
      x = gps.coords.latitude;
      y = gps.coords.longitude;
    }

    if (content.gpsEnable) {
      if (x && y) {
        //content.location_description not controllable
        const body = {
          affected_id: content.affected_id,
          location_description: content.location_description,
          x,
          y,
        };

        if (utils.getCachedUsersId()) {
          await api(
            "a_locations_create",
            {
              body,
            },
            captcha
          );
        } else {
          await api(
            "locations_create",
            {
              body,
            },
            captcha
          );
        }
        //no error. donation always possible even without location
        dispatch(showModal(["GPS will be auto-checked first.", PS.YELLOW]));
      } else {
        dispatch(
          showModal(["GPS not included. Check browser permission.", PS.YELLOW])
        );
      }
    }

    /* 3. create donation */

    if (utils.getCachedUsersId()) {
      res = await api("a_donations_create", {
        body: {
          affected_id: content.affected_id,
          campaigns_id: content.id,
          crncy: content.crncy,
          amount: content.amount,
          secret: saved.secret,
        },
        captcha,
      });
    } else {
      res = await api("donations_create", {
        body: {
          affected_id: content.affected_id,
          campaigns_id: content.id,
          crncy: content.crncy,
          secret: saved.secret,
        },
        captcha,
      });
    }

    const { donations_id, txamount, txfiatamount, txcrncy } = res;

    /* 4. donation result handling */

    if (this.error(res)) {
      return false;
    } else {
      dispatch(
        addData({
          donation: {
            donations_id,
            txhash: null,
            txcrncy,
            txamount,
            txfiatamount: utils.getCachedUsersId() ? txfiatamount : null, //dont display fiat amount in public donation
            pending: false,
          },
        })
      );
    }

    /* 5. trigger sending funds */

    // trigger background worker
    if (utils.getCachedUsersId()) {
      res = api("a_donations_send", {
        body: { donations_id },
        captcha,
      });
    } else {
      res = api("donations_send", {
        body: { secret: saved.secret },
        captcha,
      });
    }

    /* 6. check progress */

    // query background worker
    //TODO implement max fetch time
    let fetchTimeCounter = 0;
    let maxFetchTime = 60000;
    const intv = setInterval(async () => {
      let res, content;

      fetchTimeCounter+= utils.REFETCH_TIME;

      if (utils.getCachedUsersId()) {
        res = await api("a_donations_get", {
          body: { donations_id },
        });
      } else {
        res = await api("donations_get", {
          body: { secret: saved.secret },
        });
      }

      if(fetchTimeCounter > maxFetchTime){
        clearInterval(intv)
        this.noPending();
        if (!this.error(null)) return false;
      }

      /* 6a. txhash found */
      if (res && res.length > 0) content = res[0];

      if (content && content.txhash) {
        clearInterval(intv);

        this.noPending();
        dispatch(
          addData({
            donation: {
              txhash: content.txhash,
              txamount: content.amount,
              txcrncy: content.txcrncy,
              txdonationfree: content.donation_free,
            },
          })
        );
      } else if (
        /* 6b. error found */
        !res ||
        (content && content.error && content.error !== utils.NO_ERROR)
      ) {
        clearInterval(intv);

        if (this.error(content)) return false;
      } /*else if(popup.aborted){
        //TODO allow for user abort and set popup.aborted
        clearInterval(intv);
        this.noPending();
        dispatch(popupAbort(false))
      }*/
    }, utils.REFETCH_TIME);

    //TODO reload ACCOUNT_DETAILS for up-to-date balance directly without page reload

    return true;
  },

  saveForLater: function () {},

  saveDonation: async function (content, captcha = null) {
    const auth = store.getState().auth;
    dispatch(popupAbort(true));

    if (!auth.users_id) {
      dispatch(popupFn(POPUP.SIGNFORM));
      dispatch(
        addHomeViewData({
          followAction: this.saveDonationFollowup.bind(this, content, captcha),
        })
      );
    } else {
      this.saveDonationFollowup(content, captcha);
    }
  },

  saveDonationFollowup: async function (content, captcha) {
    const data = store.getState().data;

    let res;
    if (content && content.affected_id !== null) {
      res = await api("a_saved_create", {
        body: {
          affected_id: content.affected_id,
          secret: data.secrets.donationSecret,
          manual_save: 1,
        },
        captcha,
      });
    } else {
      res = await api("a_saved_create", {
        body: {
          qr_code: data.qr_code,
          secret: data.secrets.donationSecret,
          manual_save: 1,
        },
        captcha,
      });
    }

    if (this.error(res)) return false;
    dispatch(popupAbort(true));
    dispatch(popupFn(POPUP.SAVED_DONATION));
    dispatch(showModal("Saved"));
  },
};
