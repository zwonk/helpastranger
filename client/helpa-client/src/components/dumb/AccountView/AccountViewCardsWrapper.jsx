import React from "react";

import AccountCard from "components/dumb/AccountView/AccountViewCards/AccountViewCard";

import VIEWS from "constants/Views.constants";
import utils from "functions/utils/utils";

import {
  AffectedCardMidCampaigns,
  AffectedCardLeftCampaigns,
  AffectedCardRightCampaigns,
  deriveTabForCampaigns,
} from "components/dumb/AccountView/AccountViewCards/AccountViewCardCampaignCards";

import {
  AffectedCardLeftDonations,
  AffectedCardRightDonations,
  deriveTabForDonations,
} from "components/dumb/AccountView/AccountViewCards/AccountViewCardDonations";

import {
  AffectedCardLeftQrCodes,
  AffectedCardRightQrCodes,
  deriveTabForQrCodes,
} from "components/dumb/AccountView/AccountViewCards/AccountViewCardQrCodes";

import {
  AffectedCardLeftCashouts,
  AffectedCardRightCashouts,
  deriveTabForCashouts,
} from "components/dumb/AccountView/AccountViewCards/AccountViewCardCashouts";

import {
  AffectedCardLeftWithdraws,
  AffectedCardRightWithdraws,
  AffectedCardMidWithdraws,
  deriveTabForWithdraws,
} from "components/dumb/AccountView/AccountViewCards/AccountViewCardWithdraws";

import {
  AffectedCardLeftRecurrentPayments,
  AffectedCardRightRecurrentPayments,
  deriveTabForRecurrentPayments
} from "components/dumb/AccountView/AccountViewCards/AccountViewCardRecurrentPayments";

function sortIntoDates(data, field, times) {
  const contentData = times.map((x) => []);
  const today = new Date();

  data.forEach((x, i) => {
    let time = times.length - 1;
    let passed = false;

    if (new Date(x[field]).getYear() === today.getYear()) passed = true;
    if (utils.isWithinLastMonth(new Date(x[field]))) time -= 1;
    if (
      utils.getWeek(new Date(x[field])) === utils.getWeek(today)
      || ( utils.getWeek(new Date(x[field])) === utils.getWeek(today) - 1)
    ){
      time -= 1;
    }

    if (passed && (utils.getDOY(new Date(x[field])) === utils.getDOY(today))) time -= 1;

    contentData[time].push(x);
  });

  return contentData;
}

export function ACCOUNT_CARDS(props) {
  const TIMES = ["Today", "This week", "Last month", "All time"];
  const contentDataArray = props.data[props.view];
  const affectedDataMeta = props.affectedData
  let contentData = null, affectedData = null, dataIndex = [], dataIndexTmp = [];

  if (contentDataArray){
    contentData = sortIntoDates(contentDataArray, "updated_at", TIMES);
    console.log("---------")
    console.log(props.view)
    console.log(contentDataArray)
    console.log(contentData)
      let counter = 0;
      affectedData = contentData.map((contentDataBucket, timeIdx) => {
        if(timeIdx > 0) dataIndex.push(dataIndexTmp)
        dataIndexTmp = [];
        return contentDataBucket.map((item, i) => {
          const affectedDataIndex = affectedDataMeta.index.indexOf(item.affected_id);
          dataIndexTmp.push(counter++)
          return affectedDataMeta.data[affectedDataIndex]  
        })
      })
      dataIndex.push(dataIndexTmp);
  }

  let LeftCardContent = AffectedCardLeftDonations;
  let RightCardContent = AffectedCardRightDonations;
  let MidCardContent = null;
  let deriveColorFn = deriveTabForDonations;

  if (props.view === VIEWS.ACCOUNT_LAST_DONATIONS) {
    LeftCardContent = AffectedCardLeftDonations;
    RightCardContent = AffectedCardRightDonations;
    deriveColorFn = deriveTabForDonations;
  } else if (props.view === VIEWS.ACCOUNT_QR_CODE_PRINTS) {
    LeftCardContent = AffectedCardLeftQrCodes;
    RightCardContent = AffectedCardRightQrCodes;
    deriveColorFn = deriveTabForQrCodes;
  }else if (props.view === VIEWS.ACCOUNT_CASHOUTS) {
    LeftCardContent = AffectedCardLeftCashouts;
    RightCardContent = AffectedCardRightCashouts;
    deriveColorFn = deriveTabForCashouts
  } else if (props.view === VIEWS.ACCOUNT_WITHDRAWS) {
    LeftCardContent = AffectedCardLeftWithdraws;
    RightCardContent = AffectedCardRightWithdraws;
    MidCardContent = AffectedCardMidWithdraws;
    deriveColorFn = deriveTabForWithdraws;
  } else if (props.view === VIEWS.ACCOUNT_RECURRENT_PAYMENTS) {
    LeftCardContent = AffectedCardLeftRecurrentPayments;
    RightCardContent = AffectedCardRightRecurrentPayments;
    deriveColorFn = deriveTabForRecurrentPayments;
  } else if (props.view === VIEWS.ACCOUNT_CAMPAIGNS) {
    LeftCardContent = AffectedCardLeftCampaigns;
    RightCardContent = AffectedCardRightCampaigns;
    MidCardContent = AffectedCardMidCampaigns;
    deriveColorFn = deriveTabForCampaigns;
  }
  return (
    <div id="account-last-donations">
      <div className="col-12 mb-25 center container">
          {deriveColorFn(props.data).headerText}
      </div>

      {contentData ? (
        <div>
          <ul>
            {TIMES.map((timeName, time) => (
              (!contentData || !contentData[time] || contentData[time].length === 0) ? "" :  
              (<div key={time+"_div"}>
                <li key={time +"_li"} className="col-12 mb-25 center container">{timeName}</li>
                {contentData
                  ? contentData[time].map((itemData, i) => (
                      <li key={time + "" + i} className="col-12 mb-25 center container">
                        <AccountCard
                          itemData={itemData}
                          affectedData={affectedData ? affectedData[time][i] : null}
                          colorFn={deriveColorFn}
                          onClick={() => props.handleContentClick(itemData, dataIndex[time][i])}
                        >
                          <LeftCardContent itemData={itemData} />
                          {MidCardContent ? <MidCardContent itemData={itemData} /> : ""}
                          <RightCardContent itemData={itemData} />
                        </AccountCard>
                      </li>
                    ))
                  : ""}
              </div>)
            ))}
          </ul>
          {contentDataArray ? (<div className="col-12 mb-55 center container">
            <span className="text-btn" onClick={() => props.loadMore()}>Load more...</span>
          </div>) : ""}
        </div>
      ) : (
        <div className="col-12 mb-25 center container">
          <i>No Data yet</i>
        </div>
      )}
    </div>
  );
}
