import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import { useDispatch } from "react-redux";

import { updateOptions } from "reducers/slices/optionsSlice";

import LabelChooser from "components/dumb/LabelChooser";
import CampaignCard from "components/dumb/CampaignCard";
import AffectedBalance from "components/dumb/AffectedInfo/AffectedInfoBalance";

import VIEWS from "constants/Views.constants";

import utils from "functions/utils/utils";

export default withRouter((props) => {
  const fusedData = props.fusedData;

  const dispatch = useDispatch();

  const [fields, setFields] = useState({
    ...fusedData.affectedData,
    amount: fusedData.options.amountOptions[0].value,
  });

  useEffect(() => {
    setFields((fields) => ({ ...fields, ...fusedData.affectedData }));
  }, [fusedData.affectedData]);

  const [gpsEnable, setGpsEnable] = useState(false);
  const [campaignEnable, setCampaignEnable] = useState(false);
  const [showCampaign, setShowCampaign] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [storyUnfolded, setStoryUnfolded] = useState(false);

  const onEditInfos = (value, field) =>
    setFields((fields) => ({ ...fields, [field]: value }));

  const onChangeDonation = (amount) =>
    setFields((fields) => ({ ...fields, amount }));

  const onSubmit = async (fusedData, fields) => {
    let gps;

    if (isUrlQrScan && gpsEnable) {
      if (navigator.geolocation) {
        gps = (async () =>
          new Promise(function (resolve, reject) {
            navigator.geolocation.getCurrentPosition(
              (position) => resolve(position),
              (error) => resolve(null)
            );
          }))();
      }
    }

    const locationInfoChanged =
      fusedData.affectedData.location_description !==
      fields.location_description;

    props.donate({
      affected_id: fusedData.affected_id,
      secret: fusedData.itemData ? fusedData.itemData.secret : null,
      amount: fields.amount,
      crncy: utils.getCrncy(),
      name: fields.name,
      appearance: fields.appearance,
      location_description: locationInfoChanged
        ? fields.location_description
        : null,
      campaigns_id: campaignEnable ? fusedData.campaign.campaigns_id : null,
      gps,
      gpsEnable: gpsEnable,
    });
  };

  const toggleShowCampaign = () =>
    setShowCampaign((showCampaign) => !showCampaign);

  const onToggleStory = () => setStoryUnfolded(!storyUnfolded);

  const url = props.location.pathname;

  const isUrlQrScan =
    url.includes("/" + VIEWS.Q) &&
    (!fusedData.affectedData.curr_public_key ||
      (fusedData.affectedData.curr_public_key &&
        fusedData.qrScanned === fusedData.affectedData.curr_public_key));

  const nameInfoChanged = fusedData.affectedData.name !== fields.name;
  const appearanceInfoChanged =
    fusedData.affectedData.appearance !== fields.appearance;
  const locationInfoChanged =
    fusedData.affectedData.location_description !== fields.location_description;

  const noInfos = !(
    fields.name ||
    fields.appearance ||
    fields.location_description ||
    fields.videolink ||
    fields.story
  );

  const canEdit = isUrlQrScan; //TODO
  const customSwitch1 = "customSwitches" + utils.makeHash();
  const customSwitch2 = "customSwitches" + utils.makeHash();

  /* potentially deduplicate with PopupDonationInfo" */
  const story = !fields.story
    ? ""
    : storyUnfolded
    ? fields.story
    : fields.story.substring(0, 20) + "...";
  const storyUnfoldClass =
    "text-btn link no-underline fas " +
    (!storyUnfolded ? "fa-caret-down" : "fa-caret-up");

  return (
    <div>
      <div>
        {!editMode ? (
          <div>
            <div>
              {!fusedData.affected_id ? (
                ""
              ) : noInfos ? (
                canEdit ? (
                  <i>No infos here? Be the first one to help!</i>
                ) : (
                  <i>No infos yet</i>
                )
              ) : (
                (
                  <span>
                    <i>What's their name? </i>
                    <b>{fields.name}</b>
                  </span>
                ) || ""
              )}
            </div>
            <div>
              {!fusedData.affected_id ? (
                <div>
                  <img alt="spinner" width="20" src="/img/spinner.svg" />
                </div>
              ) : noInfos ? (
                ""
              ) : (
                (
                  <span>
                    <i>How do they stand out? </i>
                    <b>{fields.appearance}</b>
                  </span>
                ) || ""
              )}
            </div>
            <div>
              {!fusedData.affected_id
                ? ""
                : noInfos
                ? ""
                : (
                    <span>
                      <i>Where they at? </i>
                      <b>{fields.location_description}</b>
                    </span>
                  ) || ""}
            </div>
            <div>
              {!fusedData.affected_id
                ? ""
                : noInfos || !fields.story
                ? ""
                : (
                    <span>
                      <i>Their story </i>
                      <b>{story}</b>{" "}
                      <span onClick={onToggleStory}>
                        <i className={storyUnfoldClass}></i>
                      </span>
                    </span>
                  ) || ""}
            </div>
            <div className="center">
              {!fusedData.affected_id
                ? ""
                : noInfos || !fields.videolink
                ? ""
                : (
                    <div>
                      <div className="mb-25"></div>
                      <video width="100%" controls loop playsinline>
                        <source src={fields.videolink} type="video/mp4" />
                      </video>
                      <div className="mb-25"></div>
                    </div>
                  ) || ""}
            </div>
          </div>
        ) : (
          <div>
            <textarea
              type="text"
              onChange={(e) => onEditInfos(e.target.value, "name")}
              value={fields.name}
              placeholder="Name"
              className="form-control"
            />
            <textarea
              type="text"
              onChange={(e) => onEditInfos(e.target.value, "appearance")}
              value={fields.appearance}
              placeholder="Person description"
              className="form-control"
            />
            <textarea
              type="text"
              onChange={(e) =>
                onEditInfos(e.target.value, "location_description")
              }
              value={fields.location_description}
              placeholder="Location description"
              className="form-control"
            />
          </div>
        )}

        {!utils.getCachedUsersId() || !canEdit ? (
          !canEdit ? (
            ""
          ) : (
            <span
              onClick={() => props.signform()}
              className="small underline link"
            >
              Log in to edit beneficiary infos.
            </span>
          )
        ) : (
          <div>
            <span
              className="text-btn"
              href="#"
              onClick={() => setEditMode((editMode) => !editMode)}
            >
              {editMode ? "Preview" : "Edit"} this description
            </span>
            <small>
              {locationInfoChanged
                ? " (location description will save if gps is submitted)"
                : ""}
            </small>
            <small>
              {(appearanceInfoChanged || nameInfoChanged) &&
              !locationInfoChanged
                ? " (will save after donation)"
                : ""}
            </small>
          </div>
        )}

        <div>
          {!canEdit ? (
            ""
          ) : (
            <div>
              <hr />
              <div className="custom-control custom-switch">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id={customSwitch1}
                  onChange={() => setGpsEnable((gpsEnable) => !gpsEnable)}
                />
                <label className="custom-control-label" htmlFor={customSwitch1}>
                  Donate GPS (to locate beneficiary)
                </label>
              </div>
            </div>
          )}
          {fusedData.campaign.title ? (
            <div className="custom-control custom-switch">
              <input
                type="checkbox"
                className="custom-control-input"
                id={customSwitch2}
                onChange={() =>
                  setCampaignEnable((campaignEnable) => !campaignEnable)
                }
              />
              <label className="custom-control-label" htmlFor={customSwitch2}>
                Donate to campaign&nbsp;
              </label>
              <span className="text-btn" onClick={() => toggleShowCampaign()}>
                Read more <i className="fas fa-caret-down"></i>
              </span>
            </div>
          ) : (
            ""
          )}
          <hr />
        </div>
      </div>

      {!utils.getCachedUsersId() ? (
        ""
      ) : (
        <LabelChooser
          amount={fields.amount}
          options={fusedData.options.amountOptions}
          onOptionsChange={(amountOptions) =>
            dispatch(updateOptions({ amountOptions }))
          }
          onAmountChange={(amount) => onChangeDonation(amount.value)}
          classDesc="popup-donation-amounts"
        />
      )}

      <div className="popup-btn-wrapper">
        <div
          className="button solid-btn mb-8"
          onClick={() => onSubmit(fusedData, fields)}
        >
          <i className="fas fa-donate"></i>
          {!utils.getCachedUsersId() ? "Free donation on us" : "Donate"}
        </div>
        {utils.getCachedUsersId() ? (
          <small className="center">
            If your remaining account balance would turn below 1MIOTA the
            donation will be rounded up.
          </small>
        ) : (
          ""
        )}
        {!utils.getCachedUsersId() ? (
          <div>
            <div className="button border-btn" onClick={() => props.signform()}>
              Sign in for higher donations
            </div>
          </div>
        ) : (
          ""
        )}
      </div>

      <AffectedBalance fusedData={fusedData} name={fields.name} />

      {showCampaign ? (
        <div>
          <div id="donation-campaign" className="center">
            <CampaignCard campaign={fusedData.campaign} />
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
});
