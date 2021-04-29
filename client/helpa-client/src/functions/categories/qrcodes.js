import POPUP from "constants/Popup.constants";

import mergeImages from "merge-images"; //added: ctx.fillStyle = "transparent";

import { api } from "functions/api";
import utils from "functions/utils/utils";
import { resizeBase64ForMaxWidthAndMaxHeight } from "functions/utils/resizeBase64";


import store from "reducers/store";
import { popup, popupPending } from "reducers/slices/popupSlice";

import { addData, updateData } from "reducers/slices/dataSlice";

//TODO allow for multiple qr codes and donation saves

const dispatch = store.dispatch;

export default {
  reassignQrCode: async function (content, captcha = null) {
    api("a_qr_codes_account_assign", {
      body: { secrets: content.secrets },
      captcha,
    });
  },

  mergeQrCode: async function (qr_blobs, affected_ids) {

    const qr_variations = [
      {
        type: "small",
        name: "",
        IMG_WIDTH: 595,
        IMG_HEIGHT: 842 / 2,
        QR_X: 117,
        QR_Y: 71,
        QR_WIDTH: 350,
        QR_HEIGHT: 350,
        LOGO_Y: 25,
      },
      {
        type: "big",
        name: "-big",
        IMG_WIDTH: 2480,
        IMG_HEIGHT: 3508 / 2,
        QR_X: 117 * 4,
        QR_Y: 254, //
        QR_WIDTH: 1500,
        QR_HEIGHT: 1500,
        LOGO_Y: 60, //independent from qr offset
      },
    ];

    async function resizeQrSurface(qrBlob, w, h, noresize=true){
            if(!noresize){
              return await new Promise(resolve => {
                  resizeBase64ForMaxWidthAndMaxHeight(qrBlob, w, h,
                   (img) => resolve(img),
                   (err) => resolve(err));
              });
            }
            else {
              return qrBlob;
            }
      }

    const qr_variation_results = qr_variations.map(async (qr_vari_pre, qr_vari_index) => {

      let qr_vari = qr_vari_pre;

      if (Array.isArray(qr_blobs)) {

        const queryPromises = [];

        // 1. create individual qr_codes images

        for (let i = 0; i < qr_blobs.length; i++) {
            
          // hack to check for qr res (300/72) and create low res only, base64 length high=14000, low=4000
            if(qr_blobs[i].length < 10000 && qr_vari_pre.type === "big"){
              qr_vari = qr_variations[0];
              qr_vari_index = 0;
            }

            const qr = await resizeQrSurface(qr_blobs[i], qr_vari.QR_WIDTH, qr_vari.QR_HEIGHT, qr_vari_index);

            queryPromises.push(
              mergeImages(
                [
                  { src: qr, x: qr_vari.QR_X, y: qr_vari.QR_Y },
                  { src: "/img/CodeTopLogo"+qr_vari.name+".svg", x: 0, y: qr_vari.LOGO_Y },
                ],
                { width: qr_vari.IMG_WIDTH, height: qr_vari.IMG_HEIGHT }
              )
            );
        }

        const queryResults = await Promise.all(queryPromises);

        const qr_blob_individuals = queryResults.map((qr, ii) => ({
          x: 0,
          y: qr_vari.IMG_HEIGHT * ii,
          src: qr,
        }));

        // 2. merge individual qr_codes into one merged image

        return mergeImages(qr_blob_individuals, {
          width: qr_vari.IMG_WIDTH,
          height: qr_vari.IMG_HEIGHT * qr_blobs.length,
        });
      }

      else {
        // hack to check for qr res (300/72) and create low res only, base64 length high=14000, low=4000
        if (qr_blobs.length < 10000 && qr_vari_pre.type === "big") {
          qr_vari = qr_variations[0];
        }

        const qr = await resizeQrSurface(
          qr_blobs,
          qr_vari.QR_WIDTH,
          qr_vari.QR_HEIGHT
        );
        return mergeImages(
          [
            { src: qr, x: qr_vari.QR_X, y: qr_vari.QR_Y },
            {
              src: "/img/CodeTopLogo" + qr_vari.name + ".svg",
              x: 0,
              y: qr_vari.LOGO_Y,
            },
          ],
          { width: qr_vari.IMG_WIDTH, height: qr_vari.IMG_HEIGHT }
        );
      }

    })

    try {
      dispatch(
        addData({ qr_blob_merged: {
         content: 
          {
            small: await qr_variation_results[0],
            big: await qr_variation_results[1],
            count: Array.isArray(qr_blobs) ? qr_blobs.length : 1
          }
          , affected_ids } 
        })
      );
    } catch(e){
      return !this.error(null);
    }

    return true;
  },

  qr_create: async function (amount, qr_low_res=false, captcha = null) {
    dispatch(updateData({ qr_blob_merged: {} }));
    dispatch(popupPending(true));
    dispatch(popup(POPUP.QR_CREATE_FINISHED));

    let qrCodeSecrets = null;

    if (isNaN(amount)) {
      return !this.error(null);
    }
    const res = await api("affected_create", {
      body: { amount: parseInt(amount) },
      captcha,
    });

    if (this.error(res)) return false;

    const { affected_ids } = res;

    let res2;
    if (utils.getCachedUsersId()) {
      res2 = await api("a_qr_codes_create", {
        body: { affected_ids, qr_low_res },
        captcha,
      });
    } else {
      res2 = await api("qr_codes_create", { body: { affected_ids, qr_low_res }, captcha });
    }

    if (this.error(res2)) return false;

    const { qr_blobs, secrets } = res2;
    qrCodeSecrets = secrets;

    dispatch(
      addData({
        secrets: { qrCodeSecrets },
        qr_codes: { content: qr_blobs, affected_ids: affected_ids },
      })
    );
    dispatch(popupPending(false));

    if (qr_blobs) this.mergeQrCode(qr_blobs, affected_ids);
  },

};
