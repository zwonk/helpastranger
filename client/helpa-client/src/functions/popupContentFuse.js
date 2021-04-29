import utils from "functions/utils/utils";
import POPUP from "constants/Popup.constants";
import Functions from "functions/FunctionsMain";

/* This is the most important file in the code.
*  It merges data from redux state that was acquired through different api calls, before passing it into a popup.
*  This function is a general function that prepares the data used in all popups
*  allowing us to avoid state fetchers in every single popup.
*/

const fusePopupData = ({
  popupMeta,
  affectedDataMeta,
  accountViewData,
  homeViewData,
  adminData,
  options,
  data,
}) => {
  let itemData,
    affected_id,
    affectedData,
    affectedLocations,
    affectedExtended,
    affectedExtendedTimestamp,
    affectedLocationsTimestamp,
    txlink,
    sendbackTxlink,
    createdDate,
    sendbackCreatedDate,
    pausedState,
    recurrentAmountValue,
    recurrentPayIntervalValue,
    updatedDate;

  /* load popup content on account page */

  if (
    popupMeta.popupContent.view !== null &&
    popupMeta.popupContent.i !== null &&
    accountViewData[popupMeta.popupContent.view] &&
    accountViewData[popupMeta.popupContent.view].length >
      popupMeta.popupContent.i
  )
    itemData =
      accountViewData[popupMeta.popupContent.view][popupMeta.popupContent.i];

  /* load popup content on home page */

  if (popupMeta.popupContent.affected_id) {
    if (
      homeViewData.affected_locations &&
      homeViewData.affected_locations.length > 0
    ) {
      itemData = homeViewData.affected_locations.find(
        (x) => x.affected_id === popupMeta.popupContent.affected_id
      );
    }

    itemData = {
      ...itemData,
      affected_id: popupMeta.popupContent.affected_id,
    };
  }

  /* load popup content on admin page */
  if (
    popupMeta.popupContent.i !== null &&
    popupMeta.popupContent.view !== null &&
    adminData.usersData !== null
  ) {
    if (popupMeta.popupContent.view === "usersData") {
      itemData = adminData.usersData.find(
        (x) => utils.hashCode(x.users_id) === popupMeta.popupContent.i
      );
    } else if (popupMeta.popupContent.view === "membersData") {
      itemData = adminData.membersData.find(
        (x) => utils.hashCode(x.users_id) === popupMeta.popupContent.i
      );
    }
  }

  /* extract special vars based on itemData */

  if (itemData) {
    affected_id = itemData.affected_id;

    txlink = utils.IOTA_EXPLORER + itemData.txhash;
    sendbackTxlink = !itemData.sendback_txhash
      ? null
      : utils.IOTA_EXPLORER + itemData.sendback_txhash;

    createdDate = utils.formatDate(itemData, "created_at");
    sendbackCreatedDate = utils.formatDate(itemData, "sendback");

    pausedState = parseInt(itemData.paused_state) ? 1 : 0;

    recurrentAmountValue = options.recurrentAmountOptions.findIndex(
      (x) => x.value === itemData.amount
    );
    recurrentPayIntervalValue = options.recurrentIntervalOptions.findIndex(
      (x) => x.value === itemData.pay_interval
    );

    updatedDate = utils.formatDate(itemData, "updated_at");

    if (
      popupMeta.popup.last() === POPUP.QR_INFO &&
      itemData.qr_blob &&
      (!data.qr_blob_merged ||
        !data.qr_blob_merged.affected_ids ||
        !data.qr_blob_merged.affected_ids.includes(affected_id))
    ) {
      Functions.mergeQrCode(itemData.qr_blob, [affected_id]);
    }
  }

  /* extract single affectedData */

  if (affected_id && affectedDataMeta.index.indexOf(affected_id) > -1) {
    affectedData =
      affectedDataMeta.data[affectedDataMeta.index.indexOf(affected_id)];
    affectedLocations =
      affectedDataMeta.locations[affectedDataMeta.index.indexOf(affected_id)];
    affectedExtended =
      affectedDataMeta.extended[affectedDataMeta.index.indexOf(affected_id)];
    affectedExtendedTimestamp =
      affectedDataMeta.extendedTimestamp[
        affectedDataMeta.index.indexOf(affected_id)
      ];
    affectedLocationsTimestamp =
      affectedDataMeta.locationsTimestamp[
        affectedDataMeta.index.indexOf(affected_id)
      ];
  }

  /* extract special vars based on data and accountViewData */

  const qrBlobMerged = !data.qr_blob_merged
    ? null
    : data.qr_blob_merged.content;

  const isMember = utils.isMember(accountViewData);
  const hasAppliedForMember = utils.hasAppliedForMember(accountViewData);
  const datatxlink =
    utils.IOTA_EXPLORER + (data.donation ? data.donation.txhash : "");

  return {
    /*options*/
    options,
    /* all items */
    accountViewData,
    /* single item */
    itemData: itemData || { txhash: 1 },
    affectedData: affectedData || {},
    affectedExtended: affectedExtended || {},
    affectedExtendedTimestamp,
    affectedLocationsTimestamp,
    affectedLocations: affectedLocations || {},
    /*special data vars */
    isMember,
    hasAppliedForMember,
    createdDate,
    sendbackCreatedDate,
    updatedDate,
    qrBlobMerged,
    qrScanned: data.qr_code, //TODO clear at some point to not have gps option always appear
    txlink,
    sendbackTxlink,
    datatxlink,
    affected_id: itemData
      ? itemData.affected_id
      : popupMeta.popupContent.affected_id,
    donation: data.donation || {},
    campaign: itemData ? data.campaign || itemData.campaign || {} : {},
    errors: popupMeta.errors,
    pending: popupMeta.pending,
    pausedState,
    recurrentAmountValue,
    recurrentPayIntervalValue,
    fiatAmountSum: null,
  };
};

export default fusePopupData;