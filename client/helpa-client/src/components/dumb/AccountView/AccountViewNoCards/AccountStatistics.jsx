import React from "react";

import utils from "functions/utils/utils";

export default (props) => {
  const d = props.data.ACCOUNT_STATISTICS;
  console.log(" utils.addZeroes(d.donations_fiat_amount_sum / 100)");
  console.log(
    !d || !d.donations_fiat_amount_sum
      ? ""
      : utils.addZeroes(d.donations_fiat_amount_sum / 100)
  );
  return (
    <div>
      <div className="col-12 mb-55 center container">
        <div
          className="wow animate__animated animate__fadeInUp"
          data-wow-duration="0.9s"
        >
          <b>Total donated</b>
          <div className="border-box green">
            {d &&
            d.donations_count > 0 &&
            d.donations_fiat_amount_sum / 100 < 0.01
              ? "> "
              : ""}
            {d
              ? `${utils.getCrncySign()} ${utils.addZeroes(
                  d.donations_fiat_amount_sum / 100
                )} `
              : ""}
          </div>
        </div>
      </div>

      <div className="col-12 mb-55 center container">
        <div
          className="wow animate__animated animate__fadeInUp"
          data-wow-duration="0.9s"
        >
          <b>Total donations</b>
          <div className="border-box green">
            {d && d.donations_count != null ? d.donations_count : "0"}
          </div>
        </div>
      </div>

      <div className="col-12 mb-55 center container">
        <div
          className="wow animate__animated animate__fadeInUp"
          data-wow-duration="0.9s"
        >
          <b>Total cashed out for beneficiaries</b>
          <div className="border-box green">
            {d
              ? `${utils.getCrncySign()} ${utils.addZeroes(
                  d.cashouts_fiat_amount_sum / 100
                )} `
              : ""}
          </div>
        </div>
      </div>

      <div className="col-12 mb-55 center container">
        <div
          className="wow animate__animated animate__fadeInUp"
          data-wow-duration="0.9s"
        >
          <b>Total withdrawn from platform</b>
          <div className="border-box green">
            {d
              ? `${utils.getCrncySign()} ${utils.addZeroes(
                  d.withdraws_fiat_amount_sum / 100
                )} `
              : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
