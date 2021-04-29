import React, { useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";

import { withRouter } from "react-router-dom";

import {
  Map as LeafletMap,
  TileLayer,
  Marker,
  ScaleControl,
  Popup as LeafletPopup,
} from "react-leaflet";
import L from "leaflet";
import QrReader from "components/dumb/QrReader";
import CampaignCard from "components/dumb/CampaignCard";

import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

import POPUP from "constants/Popup.constants";

import Functions from "functions/FunctionsMain";
import CaptchaedFunctions from "functions/CaptchaedFunctions";
import DoubleCaptchaedFunctions from "functions/DoubleCaptchaedFunctions"; //TODO doubleCaptchaed
import utils from "functions/utils/utils";
import useDebounce from "functions/utils/debounce";

import { setReaderActivity } from "reducers/slices/homeViewDataSlice";
import { popup as popupFn } from "reducers/slices/popupSlice";

const HOME_MAP = "HOME_MAP";

const DEFAULT_POSITION = [51.50928285217833, -0.1210245835781097];
const ZOOM_START_MAIN = utils.ZOOM_START_MAIN;

export default withRouter((props) => {
  const dispatch = useDispatch();

  const { executeRecaptcha } = useGoogleReCaptcha();
  const captchaedFunctions = new CaptchaedFunctions(executeRecaptcha);
  const doubleCaptchaedFunctions = new DoubleCaptchaedFunctions(
    captchaedFunctions,
    executeRecaptcha
  );

  const homeViewData = useSelector((state) => state.homeViewData);
  const [viewPortVal, setViewPortVal] = useState({
    center: { lat: DEFAULT_POSITION[0], lng: DEFAULT_POSITION[1] },
    zoom: ZOOM_START_MAIN,
  });
  const [map, setMap] = useState(null);
  const [affectedPlatformCounter, setAffectedPlatformCounter] = useState(0);

  useEffect(() => {
    captchaedFunctions.fetchToHomeViewDataPlatformInfo();

    const paramPublicKey = props.match.params.q;

    handleScan(paramPublicKey);

    captchaedFunctions.getUsersMemberState();

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (homeViewData.userLocation && !utils.HOME_MAP_SET_DEFAULT_LOCATION) {
      setViewPortVal({
        center: {
          lat: homeViewData.userLocation[0],
          lng: homeViewData.userLocation[1],
        },
        zoom: ZOOM_START_MAIN,
      });
    }
  }, [homeViewData.userLocation]);

  useEffect(() => {
    const num = homeViewData.platformInfo.qr_codes_total_used;
    if (num) {
      const numFormatted = num.toString().padStart(5, "0");
      setAffectedPlatformCounter(numFormatted);
    }
  }, [homeViewData.platformInfo]);

  const handleScan = (result) => {
    if (result) doubleCaptchaedFunctions.handleScan(result);
  };

  const handleMapChange = (e) => {
    const zoom = e.target._animateToZoom;
    const center = e.target._animateToCenter;

    if (zoom && center) setViewPortVal({ zoom, center });
  };

  const debouncedViewPort = useDebounce(viewPortVal, 1000);

  useEffect(() => {
    doubleCaptchaedFunctions.fetchToHomeViewData(
      debouncedViewPort.center.lat,
      debouncedViewPort.center.lng,
      debouncedViewPort.zoom,
      map
    );

    // eslint-disable-next-line
  }, [debouncedViewPort, executeRecaptcha]);

  const redLocatorIcon = L.icon({
    ...L.Icon.Default.prototype.options,
    iconUrl: require("../../marker-icon-red.png"),
    iconRetinaUrl: require("../../marker-icon-2x-red.png"),
    shadowUrl: require("../../marker-shadow.png"),
  });

  return (
    <div id="Home">
      {homeViewData.readerActive ? (
        <div className="qr-reader-wrapper">
          <div className="qr-reader-top-bar">
            Please, scan the person's QR code.
            <i
              className="close-black fas fa-times"
              onClick={() => dispatch(setReaderActivity(false))}
            ></i>
          </div>
          <QrReader handleScan={(res) => handleScan(res)} />
        </div>
      ) : (
        <span
          className="c-btn"
          onClick={() => dispatch(setReaderActivity(true))}
        >
          <div className="pro-pic container d-flex align-items-center flex-column">
            <div className="pro-pic-wrapper">
              <div className="pro-pic-wrap" style={{ width: "80%" }}>
                <span className="blt"></span>
                <span className="blb"></span>
                <span className="brt"></span>
                <span className="brb"></span>
                <video
                  width="182"
                  src="/img/anim-main.mov"
                  autoPlay
                  loop
                  muted
                  playsInline
                  alt="beneficiary holding donation sign"
                  poster="/img/anim-main.jpg"
                />
              </div>
            </div>
            <h3>Scan the QR code</h3>
          </div>
        </span>
      )}

      {/*<!-- money flow area start -->*/}
      <section id="process" className="money-flow">
        <div className="container">
          <div className="row">
            <div className="col-12 mb-55 single-flow-wrapper">
              <div
                className="single-flow first hue-animated wow animate__animated animate__fadeInUp"
                data-wow-duration="0.9s"
              >
                <div className="show-flow">
                  <span className="flow-round">
                    <img
                      src="/img/cc-pay-brands.svg"
                      width="30"
                      alt="apple-pay"
                    />
                  </span>
                  <span className="long-arrow">
                    <img src="/img/bitcoin-2.svg" alt="bitcoin" />
                  </span>
                  <span className="flow-round">
                    <img
                      src="/img/poor-bitcoin.svg"
                      alt="poor-receiving-bitcoin"
                    />
                  </span>
                </div>
                <div className="single-flow-desc first">
                  <div className="single-flow-desc-title">
                    Donate contactless.
                  </div>
                  <small>Donate free on us - no account needed.</small>
                  <br />
                  <br />
                  <small>
                    Load 0{utils.getCrncySign()}+ to your account by sending
                    crypto - no ID needed.
                  </small>
                  <br />
                  <br />
                  <small>
                    Load 30{utils.getCrncySign()}+ to your account via credit
                    card - no crypto or ID needed.
                  </small>
                </div>
              </div>
            </div>{" "}
            {/*<!-- col end -->*/}
            <div className="col-12 mb-55 single-flow-wrapper">
              <div
                className="single-flow hue-animated wow animate__animated animate__fadeInUp"
                data-wow-duration="0.9s"
              >
                <div className="show-flow">
                  <span className="flow-round">
                    <img
                      src="/img/map-marker-alt-solid.svg"
                      width="25"
                      alt="user"
                    />
                  </span>
                  {/*<!--<span className="long-arrow">
                    <img src="/img/bitcoin-2-double.svg" alt="bitcoin" />
                  </span> -->*/}
                  <span className="flow-round">
                    <img
                      src="/img/poor-bitcoin.svg"
                      alt="poor-receiving-bitcoin"
                    />
                  </span>
                </div>
                <p className="single-flow-desc">
                  Optionally share your GPS to help us find the beneficiary.
                </p>
              </div>
            </div>{" "}
            {/*<!-- col end -->*/}
            <div className="col-12 single-flow-wrapper">
              <div
                className="single-flow hue-animated wow animate__animated animate__fadeInUp"
                data-wow-duration="0.9s"
              >
                <div className="show-flow">
                  <span className="flow-round">
                    <img src="/img/user-group.svg" alt="user" />
                  </span>
                  <span className="long-arrow">
                    <img src="/img/doller.svg" alt="dollar" />
                  </span>
                  <span className="flow-round">
                    <img src="/img/poor.svg" alt="poor" />
                  </span>
                </div>
                <p className="single-flow-desc">
                  Members exchange crypto to cash for the beneficiary.
                </p>
              </div>
            </div>{" "}
            {/*<!-- col end -->*/}
            <div className="col-12 text-center">
              <span className="more-flow">
                <i className="fas fa-caret-down"></i>
              </span>
            </div>
          </div>{" "}
          {/*<!-- row end -->*/}
        </div>{" "}
        {/*<!-- container end -->*/}
      </section>
      {/*<!-- money flow area end -->*/}

      {/*<!-- cta area start -->*/}
      <section
        className="cta wow animate__animated animate__fadeInUp"
        data-wow-delay=".2s"
        data-wow-duration="0.9s"
      >
        <div className="container">
          <h3 className="section-title">Don't see a QR plate at the person?</h3>
          <span
            className="button solid-btn"
            onClick={() => dispatch(popupFn(POPUP.QR_CREATE))}
            id="cta-btn"
          >
            <img src="/img/qr.svg" alt="qr" />
            Create a QR plate
          </span>
          <div className="sub-text small">
            and print it like{" "}
            <span
              className="text-btn small"
              onClick={() => dispatch(popupFn(POPUP.TUT_PRINT))}
            >
              this
            </span>
          </div>
          <hr />
        </div>
      </section>
      {/*<!-- cta area end -->*/}

      {/*<!-- simple as area start -->*/}
      <section
        className="simple wow animate__animated animate__fadeInUp"
        data-wow-duration="0.9s"
      >
        <div className="container">
          <h3 className="section-title">Simple as can be</h3>
          <ul>
            <li>
              <span className="iota-icon"></span> We use the cryptocurrency IOTA{" "}
              which is similar to but more&nbsp;
              <span
                className="text-btn small"
                onClick={() => dispatch(popupFn(POPUP.TUT_IOTA_SUSTAINABLE))}
              >
                sustainable
              </span>
              &nbsp;than Bitcoin.
            </li>
            <li>
              <span role="img" aria-label="emoji-bank">
                🏦{" "}
              </span>
              This way you can donate to people that don't have access to bank
              accounts, and we can avoid fees with intermediaries.
            </li>
            <li>
              All donations are direct and 100% feeless. You can even donate
              without using this website if you understand IOTA.
            </li>
            <li>
              <span role="img" aria-label="emoji-credit-card">
                💳
              </span>
              /
              <span role="img" aria-label="emoji-apple-logo">
                
              </span>
              /G pay You can load funds to your account directly via credit card
              or by sending IOTA tokens to it from another 'IOTA wallet'.
            </li>
            <li>
              <span role="img" aria-label="emoji-checked">
                ✅
              </span>{" "}
              Verified members convert and deliver the donated sum in{" "}
              <span
                className="text-btn small"
                onClick={() => Functions.popup(POPUP.TUT_CASHOUT)}
              >
                cash
              </span>{" "}
              while monitoring its use by the beneficiary.
            </li>
          </ul>
        </div>
      </section>
      {/*<!-- simple as area end -->*/}

      {/*<!-- map area start -->*/}
      <section
        className="map wow animate__animated animate__fadeInUp"
        data-wow-delay=".2s"
        data-wow-duration="0.9s"
      >
        <h3 className="section-title">Find a beneficiary</h3>
        <div className="map-img-wrapper">
          <div className="map-img-shadow"> </div>
          <div className="map-img">
            <LeafletMap
              center={viewPortVal.center}
              zoom={viewPortVal.zoom}
              onZoomend={handleMapChange}
              onDragend={handleMapChange}
              whenReady={setMap}
            >
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {homeViewData.affected_locations
                ? homeViewData.affected_locations.map((l, i) => (
                    <Marker
                      key={i}
                      position={[l.x, l.y]}
                      icon={
                        l.user_spent ? redLocatorIcon : L.Icon.Default.prototype
                      }
                    >
                      <LeafletPopup>
                        <div className="center">
                          <p>
                            {l.location_address
                              ? l.location_address
                                  .split(",")
                                  .slice(0, -1)
                                  .join(",")
                              : ""}
                          </p>
                          <p>
                            <i>{l.location_description}</i>
                          </p>
                          {l.campaign_title ? (
                            <div>
                              <br />
                              <div className="map-marker-campaign-box">
                                <div>
                                  <i className="fas fa-hands-helping"></i>
                                  {l.campaign_title ? (
                                    <div>Active campaign</div>
                                  ) : (
                                    ""
                                  )}
                                </div>
                                <div className="center">
                                  <CampaignCard
                                    campaign={{ ...l, ...l.campaign }}
                                    caller={HOME_MAP}
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            ""
                          )}
                          <p>
                            <span
                              className="text-btn"
                              onClick={() =>
                                captchaedFunctions.fetchToHomeViewDataSingle(
                                  l.affected_id
                                )
                              }
                            >
                              More actions{" "}
                              <i className="fas fa-caret-right"></i>
                            </span>
                          </p>
                        </div>
                      </LeafletPopup>
                    </Marker>
                  ))
                : ""}
              <ScaleControl />
            </LeafletMap>
          </div>
          <div className="map-img-shadow bottom"> </div>
        </div>
      </section>
      {/*<!-- map area end -->*/}

      {/*<!-- join area start -->*/}
      <section
        className="join wow animate__animated animate__fadeInUp"
        data-wow-delay=".2s"
        data-wow-duration="0.9s"
      >
        <div className="container text-center stacked-buttons">
          <div
            className="button border-btn right"
            onClick={() => dispatch(popupFn(POPUP.SIGNFORM))}
          >
            Sign in / Sign up<i className="fas fa-arrow-circle-right"></i>
          </div>
          <div>or</div>
          <div
            className="button solid-btn"
            id="verified-btn"
            onClick={() => dispatch(popupFn(POPUP.APPLY_MEMBERSHIP_0))}
          >
            <img src="/img/verified.svg" alt="verified" />
            Get verified
          </div>
        </div>
      </section>
      {/*<!-- join area end -->*/}

      {/*<!-- call center area start -->*/}
      {/*<section
        className="call-center wow animate__animated animate__fadeInUp"
        data-wow-delay=".2s"
        data-wow-duration="0.9s"
      >
        <div className="container">
          <hr />
          <h3 className="section-title">Still don't get it? Call a member.</h3>
          <div className="number">
            <i className="fas fa-phone-alt"></i>
            <h2>+441829382938</h2>
          </div>
        </div>
      </section>*/}
      {/*<!-- call center area end -->*/}
      <section
        className="call-center wow animate__animated animate__fadeInUp"
        data-wow-delay=".2s"
        data-wow-duration="0.9s"
      >
        <div className="container">
          <hr />
          <div className="mb-25"></div>
          <h1 className="text-shadow center">Why it started</h1>
          <div className="center">
            <i className="fas fa-2x fa-caret-down"></i>
          </div>
          <h2 className="section-title">
            Homeless at any given night in London{" "}
            <div className="img-inline-align">
              <img
                alt="emoji-city-scape-animated"
                data-attribution="https://www.behance.net/gallery/45319335/City-Nightscape-GIF-Animation"
                className="emoji-city-scape-animated"
                src="/img/city-scape-animated.gif"
              />
            </div>
          </h2>
        </div>

        <div id="affected-total-counter" className="numCounterWrapper">
          <div className="numCounter jsCounter1" data-value={170068}></div>
        </div>

        <div className="affected-counter-descriptions container mb-36">
          <div>
            <small>
              as reported by{" "}
              <a
                className="text-btn"
                target="_blank"
                rel="noopener noreferrer"
                href="https://england.shelter.org.uk/__data/assets/pdf_file/0009/1883817/This_is_England_A_picture_of_homelessness_in_2019.pdf#page=6"
              >
                Shelter 2019
              </a>
            </small>
          </div>
          <p>
            <small>
              (of which 10,726 have been estimated to be roughsleeping at least
              once that year according to&nbsp;
              <a
                className="text-btn"
                target="_blank"
                rel="noopener noreferrer"
                href="https://data.london.gov.uk/download/chain-reports/d40d34b3-e3e0-415e-ae7a-4678d83f5058/Greater%20London%20full%202019-20.pdf#page=8"
              >
                CHAIN report 2019/20
              </a>
              )
            </small>
          </p>
        </div>

        <div className="container">
          <hr />
          <h2 className="section-title no-bottom">
            Empowered beneficiaries{" "}
            <div className="img-inline-align">
              <img
                alt="emoji-globe-animated"
                className="emoji-globe-animated"
                src="/img/earth-emoji-spinning.gif"
              />
            </div>
          </h2>
        </div>

        <div id="affected-onboard-counter" className="numCounterWrapper">
          <div
            className="numCounter jsCounter2"
            data-value={affectedPlatformCounter}
          ></div>
        </div>

        <div className="affected-counter-descriptions container mb-36">
          <p>
            <small>
              as counted by the total number of QR codes which received
              donations since 2021.
            </small>
          </p>
        </div>
      </section>

      <div className="call-center">
        <div className="container">
          <hr />
        </div>
      </div>

      <section
        className="call-center wow animate__animated animate__fadeInUp"
        data-wow-delay=".2s"
        data-wow-duration="0.9s"
      >
        <div className="container home-last center">
          <div className="video-container">
            <video
              src="/img/animation_waving.mov"
              width="50%"
              autoPlay
              loop
              muted
              playsInline
            ></video>
          </div>
          <div className="spacerPoweredBy"></div>
          <small>
            This platform is powered by{" "}
            <a
              className="share-pin logo-iota"
              alt="donate"
              rel="noopener noreferrer"
              target="_blank"
              href="https://www.iota.org/"
            >
              IOTA
            </a>{" "}
            technology.
          </small>
          <br />
        </div>
      </section>
    </div>
  );
});
