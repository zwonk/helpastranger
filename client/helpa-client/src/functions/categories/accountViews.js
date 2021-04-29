import VIEWS from "constants/Views.constants";
import PS from "constants/PopupStatus.constants";

import { api } from "functions/api";
import utils from "functions/utils/utils";

import store from "reducers/store";
import { redirect as redirectFn } from "reducers/slices/popupSlice";

import { updateAccountViews } from "reducers/slices/accountViewsSlice";

import {
  updateAccountViewData,
  addAccountViewData,
} from "reducers/slices/accountViewDataSlice";

import { updateAffectedData } from "reducers/slices/affectedDataSlice";

import { updateData } from "reducers/slices/dataSlice";

import { showModal } from "reducers/slices/topModalSlice";

const dispatch = store.dispatch;

const AFFECTED_DATA_DEPENDENT_VIEWS = [VIEWS.ACCOUNT_LAST_DONATIONS, VIEWS.ACCOUNT_QR_CODE_PRINTS, VIEWS.CASHOUTS];

/* content cards data  */

export default {
  fetchToViewContentList: async function (endpoint, view, start = null, captcha = null) {
    console.log("---" + endpoint);

    const state = store.getState();

    const startVal = start === null ? 0 : start;

    let contentData = await api(endpoint, {
      body: { idType: utils.USERS, start: startVal, crncy: utils.getCrncy() },
      captcha,
    });
    if (this.error(contentData)) {
      return false;
    }

    /* merging viewData (data already shown in an "accountView") */

    let finalContent, updateableContent;
    const renderedContent = state.accountViewData[view] || [];
    const renderedContentIds = renderedContent.map((e) => e.id);
    const newContent = contentData.filter(
      (el) => !renderedContentIds.includes(el.id)
    );
    //prepending new content
    if (start === null) {
      finalContent = contentData;
      updateableContent = contentData;
    }
    //appending load more content
    else {
      finalContent = renderedContent.concat(newContent);
      updateableContent = newContent;
    }

    /* pagination */

    let dataStartIndex = state.accountViews.dataStartIndex;

    if (startVal > 0) {
      const index = state.accountViews.options.findIndex((x) => x === view);
      dataStartIndex = dataStartIndex.set(index, startVal);
    }

    dispatch(updateAccountViewData({ [view]: finalContent }));
    dispatch(updateAccountViews({ dataStartIndex }));

    /* affected data to cache */

    console.log("---updateableContent")
    console.log(updateableContent)
    if(AFFECTED_DATA_DEPENDENT_VIEWS.includes(view)){

      //TODO maybe make affected reload for all content cards if fast enough

      const updateableAffectedIds = updateableContent
        .map((el) => el.affected_id)
        .filter(utils.deduplicate)
        .join();

      let contentAffected;

      //TODO for qr codes, omit the qr codes and load them when card is selected instead.
      if (updateableAffectedIds)
        contentAffected = await api("affected_get_data_package", {
          body: { affected_ids: updateableAffectedIds}, captcha ,
        });

      if (contentAffected && !contentAffected.error && contentAffected.length > 0)
        dispatch(updateAffectedData(contentAffected));
      }
  },

  /* content no cards data  */

  fetchToViewUsersData: async function (caller = null, captcha = null) {
    const auth = store.getState().auth;

    const userData = await api("a_users_get_data", {
      body: { users_id: utils.getCachedUsersId() },
      captcha,
    });

    if (userData && !userData.error) {
      if (caller === "postSignIn") {
        if (userData && !userData.email) {
          dispatch(
            showModal([
              "Fill out your email under 'Settings' to be able to recover your account.",
              PS.YELLOW,
            ])
          );
        } else if (auth.passw_recovery_used) {
          dispatch(
            showModal([
              "Change your password immediately under 'Settings'.",
              PS.YELLOW,
            ])
          );
        }
      }
    }

    /*if (this.error(userData)) {
      dispatch(redirectFn(true));
      return false;
    }*/

    console.log(userData)

    dispatch(updateAccountViewData({ ACCOUNT_SETTINGS: userData }));
  },

  fetchToViewAccountStatistics: async function (endpoint, view, captcha = null) {
    let contentData = await api(endpoint, {
      body: { id: utils.getCachedUsersId(), idType: utils.USERS, crncy: utils.getCrncy()}, captcha,
    });

    if (this.error(contentData)) return false;

    dispatch(updateAccountViewData({ [view]: contentData }));
  },

  fetchToViewAccountDetails: async function (captcha = null) {
    
    const userData = await api("a_users_get_data", {
      body: { users_id: utils.getCachedUsersId() },
      captcha,
    });

    if (this.error(userData)) {
      dispatch(redirectFn(true));
      return false;
    }

    dispatch(addAccountViewData({ ACCOUNT_DETAILS: userData }));

    /* BALANCE IOTA */
    const userDataBalance = await api("a_users_get_balance", {
      body: { users_id: utils.getCachedUsersId(), crncy: utils.getCrncy() },
    });

    //no error handling

    if (userDataBalance && !userDataBalance.error) {
      dispatch(addAccountViewData({ ACCOUNT_DETAILS: { userDataBalance } }));
    }

    return true;
  },

  /* content dispatcher */

  refetchAccountView: function (captcha = null) {
    this.switchAccountView(0, true, null, captcha);
  },

  switchAccountView: async function (direction, refresh = false, start = null, captcha = null) {
    const state = store.getState();
    
    let ACCOUNT_VIEWS = state.accountViews.optionsInit; //TODO little hacky to set with optionsInit
    let ACCOUNT_VIEWS_FILTERED = ACCOUNT_VIEWS;

    const isMember = utils.isMember(state.accountViewData);
    if (!isMember) {
      ACCOUNT_VIEWS_FILTERED = utils.removeByValues(ACCOUNT_VIEWS, [
        VIEWS.ACCOUNT_CASHOUTS,
        VIEWS.ACCOUNT_RECURRENT_PAYMENTS,
        VIEWS.ACCOUNT_CAMPAIGNS,
      ]);
    }

    const viewIndex = state.accountViews.viewIndex;
    const optionsLength = ACCOUNT_VIEWS_FILTERED.length;
    const newViewIndex = utils.mod(viewIndex + direction, optionsLength);
    const view = ACCOUNT_VIEWS_FILTERED[newViewIndex];

    /* DETAILS */
    if (
      view === VIEWS.ACCOUNT_DETAILS &&
      (!state.accountViewData.ACCOUNT_DETAILS || refresh)
    ) {
      this.fetchToViewAccountDetails(captcha);
    } else if (
      /* DONATIONS */
      view === VIEWS.ACCOUNT_LAST_DONATIONS &&
      (!state.accountViewData.ACCOUNT_LAST_DONATIONS || refresh)
    ) {
      this.fetchToViewContentList("a_donations_and_saved_get_all", view, start, captcha);
    } else if (
      /* QR_CODES */
      view === VIEWS.ACCOUNT_QR_CODE_PRINTS &&
      (!state.accountViewData.ACCOUNT_QR_CODE_PRINTS || refresh)
    ) {
      this.fetchToViewContentList("a_qr_codes_get_all_with_stats", view, start, captcha);
    } else if (
      /* CASHOUTS */
      view === VIEWS.ACCOUNT_CASHOUTS &&
      (!state.accountViewData.ACCOUNT_CASHOUTS || refresh)
    ) {
      this.fetchToViewContentList("a_cashouts_get_all", view, start, captcha);
    } else if (
      /* WITHDRAWS */
      view === VIEWS.ACCOUNT_WITHDRAWS &&
      (!state.accountViewData.ACCOUNT_WITHDRAWS || refresh)
    ) {
      this.fetchToViewContentList("a_withdraws_get_all", view, start, captcha);
    } else if (
      /* RECURRENT_PAYMENTS */
      view === VIEWS.ACCOUNT_RECURRENT_PAYMENTS &&
      (!state.accountViewData.ACCOUNT_RECURRENT_PAYMENTS || refresh)
    ) {
      this.fetchToViewContentList(
        "a_recurrents_get_all_with_stats",
        view,
        start,
        captcha
      );
    } else if (
      /* CAMPAIGNS_PAYMENTS */
      view === VIEWS.ACCOUNT_CAMPAIGNS &&
      (!state.accountViewData.ACCOUNT_CAMPAIGNS || refresh)
    ) {
      this.fetchToViewContentList(
        "a_campaigns_get_all_associated_with_stats",
        view,
        start,
        captcha
      );
    } else if (
      /* STATISTICS */
      view === VIEWS.ACCOUNT_STATISTICS &&
      (!state.accountViewData.ACCOUNT_STATISTICS || refresh)
    ) {
      this.fetchToViewAccountStatistics("a_users_donations_stats", view, captcha);
    } else if (
      /* SETTINGS */
      view === VIEWS.ACCOUNT_SETTINGS &&
      (!state.accountViewData.ACCOUNT_SETTINGS || refresh)
    ) {
      this.fetchToViewUsersData(null, captcha);
    }

    dispatch(
      updateAccountViews({
        viewIndex: newViewIndex,
        options: ACCOUNT_VIEWS_FILTERED,
      })
    );

    let memes;
    if(state.data && state.data.memes){
      memes = state.data.memes;
    }

    if(!memes)
      this.fetchMemeToData()

    if (memes && viewIndex !== newViewIndex) {
      //(1) img array
      if (Array.isArray(memes) && memes.length > 0) {
        dispatch(updateData({ meme: utils.pickRandom(memes).link }));
      }
      //(2) coinchart
      else if(memes === true) {
        dispatch(updateData({ meme: true }));
      }
    }
    //(null) default text

  },

  fetchMemeToData: async function(captcha = null){
    const res = await api("get_memes", {
      body: { users_id: utils.getCachedUsersId()}, captcha,
    });

    if(res && !res.error){
      const memes = res;

      //(1) img array
      if (Array.isArray(memes) && memes.length > 0) {
        dispatch(updateData({ memes , meme: utils.pickRandom(memes).link }));
      }
      //(2) coinchart
      else if(memes === true) {
        dispatch(updateData({ memes: true, meme: true }));
      }
    }
  //(null) default text

  },

};
