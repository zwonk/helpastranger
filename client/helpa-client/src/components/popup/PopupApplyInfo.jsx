import React from "react";
import utils from "functions/utils/utils";

export default (props) => {
  const fusedData = props.fusedData;

  let btnClass, btnText, btnFn;
  if (!utils.getCachedUsersId()) {
    btnClass = "button border-btn";
    btnText = "Sign in to apply";
    btnFn = () => props.signform();
  } else if (fusedData.isMember) {
    btnClass = "button solid-btn inactive";
    btnText = "You are a member";
    btnFn = () => {};
  } else if (fusedData.hasAppliedForMember) {
    btnClass = "button solid-btn inactive";
    btnText = "You have applied";
    btnFn = () => {};
  } else {
    btnClass = "button solid-btn";
    btnText = "Apply for membership";
    btnFn = () => props.loadMembershipApplyScreen();
  }

  return (
    <div>
      <div className="mb-25">
        <div className="">
          Becoming a verified member allows you to cashout for affected people,
          get access to new features, and be rewarded with upcoming perks{" "}
          <span role="img" aria-label={"emoji-diamond"}>
            {utils.EMOJI_LABELS["emoji-diamond"]}
          </span>
          . By applying you grant us access to your personal details and we will
          personally contact you after a successful application.
          <br />
          {fusedData.hasAppliedForMember ? (
            <small>
              Wait for the outcome (~1 week) or shoot us a{" "}
              <a
                className="text-btn"
                href={utils.mailTo(
                  "Change%20membership%20application%20id:%20" +
                    utils.getCachedUsersId()
                )}
              >
                mail
              </a>{" "}
              for changes.
            </small>
          ) : (
            ""
          )}
        </div>

        <div className="video-container">
          <video
            width="80%"
            className="video-container-cashout"
            autoPlay
            loop
            muted
            playsInline
            poster="/img/spinner.svg"
            alt="person delivering cash"
          >
            <source src="/img/anim-cashout.mov" type="video/mp4" />
          </video>
        </div>

        <div className="col-12 center mb-25 container">
          <div className="popup-btn-wrapper-narrow">
            <div href="#" className={btnClass} onClick={btnFn}>
              {btnText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
