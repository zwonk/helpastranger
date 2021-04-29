import React, { useEffect, useState } from "react";

import AffectedLocationHistory from "components/dumb/AffectedInfo/AffectedInfoLocationHistory";
import AffectedDonateButtons from "components/dumb/DonateButtons";
import AffectedBalance from "components/dumb/AffectedInfo/AffectedInfoBalance";

import utils from "functions/utils/utils";

import POPUP from "constants/Popup.constants";

export default (props) => {
  const fusedData = props.fusedData;

  const [editMode, setEditMode] = useState(false);
  const [fields, setFields] = useState({});
  const [printState, setPrintState] = useState(0);
  const [storyUnfolded, setStoryUnfolded] = useState(false);

  useEffect(() => {
    setFields(fusedData.affectedData);
  }, [fusedData.affectedData]);

  const join = (x) =>
    (x.name || "") +
    (x.appearance || "") +
    (x.story || "" + (x.videolink || ""));

  const onEditMode = (value, field) =>
    setFields((fields) => ({
      ...fields,
      [field]: value,
    }));

  const onSubmit = (fields) => {
    if (editMode) {
      const infosChanged = join(fusedData.affectedData) !== join(fields);

      if (infosChanged)
        props.changeInfos({
          affected_id: fusedData.affected_id,
          name: fields.name,
          appearance: fields.appearance,
          story: fields.story,
        });
    }

    setEditMode((editMode) => !editMode);
  };

  const onToggleStory = () => setStoryUnfolded(!storyUnfolded);

  const infosChanged = join(fusedData.affectedData) !== join(fields);
  const noInfos = !(
    fields.name ||
    fields.appearance ||
    fields.story ||
    fields.videolink
  );

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
      {props.caller === POPUP.HOME_MAP_AFFECTED_INFO ? (
        ""
      ) : props.caller === POPUP.QR_INFO ? (
        <div>
          <div className="col-12 center container">
            <span
              className="text-btn"
              onClick={() => {
                setPrintState(1);
                utils.print(fusedData.qrBlobMerged.big, () => setPrintState(0));
              }}
            >
              <h3>Reprint QR code</h3>
            </span>

            {printState ? (
              <div className="line-align center">
                <img alt="spinner" width="20" src="/img/spinner.svg" />
                <div>
                  <small>
                    Generating PDF ~{utils.pdfGenerationEstimate()}s
                  </small>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
          <hr />
        </div>
      ) : (
        <div>
          <div>Donation from: {fusedData.createdDate}</div>
          <div>
            {!fusedData.itemData.txhash ? (
              <div className="line-align">
                {fusedData.itemData.tab === "saved"
                  ? "Saved or aborted donation"
                  : "Transaction still processing..."}
              </div>
            ) : (
              <small>
                Track{" "}
                <a
                  className="text-btn"
                  rel="noopener noreferrer"
                  target="_blank"
                  href={fusedData.txlink}
                >
                  your transaction
                </a>{" "}
                in the iota network.
              </small>
            )}
          </div>
          <hr />
        </div>
      )}

      <div>
        <p className="center">
          <b>Beneficiary</b>
        </p>
        {!editMode ? (
          <div>
            <div>
              {noInfos ? (
                <i>No infos yet</i>
              ) : fields.name ? (
                <span>
                  <i>Name: </i>
                  <b>{fields.name}</b>
                </span>
              ) : (
                ""
              )}
            </div>
            <div>
              {fields.appearance ? (
                <span>
                  <i>Appearance: </i>
                  <b>{fields.appearance}</b>
                </span>
              ) : (
                ""
              )}
            </div>
            <div>
              {!fusedData.affected_id
                ? ""
                : noInfos || !fields.story
                ? ""
                : (
                    <span>
                      <i>Story: </i>
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
                      <video width="100%" controls loop playsInline>
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
              placeholder={"Name"}
              onChange={(e) => onEditMode(e.target.value, "name")}
              value={fields.name || ""}
              className="form-control"
            />
            <textarea
              type="text"
              placeholder={"Appearance"}
              onChange={(e) => onEditMode(e.target.value, "appearance")}
              value={fields.appearance || ""}
              className="form-control"
            />
            <textarea
              type="text"
              placeholder={"Story"}
              onChange={(e) => onEditMode(e.target.value, "story")}
              value={fields.story || ""}
              className="form-control"
            />
          </div>
        )}
      </div>

      {!utils.getCachedUsersId() ? (
        ""
      ) : (
        <div>
          <span className="text-btn" onClick={() => onSubmit(fields)}>
            {!editMode
              ? "Edit infos"
              : infosChanged
              ? "Save changes to network"
              : "View infos"}
          </span>
        </div>
      )}

      <hr />

      <AffectedLocationHistory
        affectedData={fusedData.affectedData}
        locations={fusedData.affectedLocations}
        caller={props.caller}
      />

      <AffectedDonateButtons
        props={{
          title: fusedData.campaign.title,
          name: fusedData.affectedData.name,
          tab: fusedData.itemData.tab,
          caller: props.caller,
          startDonation: () => {
            onSubmit(fields);
            props.startDonation();
          },
          startRecurrent: () => {
            onSubmit(fields);
            props.startRecurrent();
          },
          startCampaign: () => {
            onSubmit(fields);
            props.startCampaign();
          },
          deleteEntry: props.deleteEntry,
          report: props.report,
        }}
      />

      <AffectedBalance
        fusedData={fusedData}
        name={fields.name}
        signform={() => props.signform()}
        modal={(arr) => props.modal(arr)}
        startCashout={() => props.startCashout()}
      />
    </div>
  );
};
