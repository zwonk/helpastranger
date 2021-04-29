import React, { useState, useEffect } from "react";

import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

import { useDispatch, useSelector } from "react-redux";

import POPUP from "constants/Popup.constants";

import "react-tabulator/lib/styles.css"; // required styles
import "react-tabulator/lib/css/tabulator.min.css"; // theme
import { ReactTabulator } from "react-tabulator"; // for React 15.x, use import { React15Tabulator }

//import { reactFormatter } from "functions/utils/tabulatorUtils";
import utils from "functions/utils/utils";

import {
  popup as popupFn,
  updatePopupContent,
} from "reducers/slices/popupSlice";
import CaptchaedFunctions from "functions/CaptchaedFunctions";

/*
function SimpleButton(props) {
  const rowData = props.cell._cell.row.data;
  const cellValue = props.cell._cell.value || "Edit | Show";
  return <button onClick={() => alert(rowData.name)}>{cellValue}</button>;
}*/

export default () => {
  const dispatch = useDispatch();

  const { executeRecaptcha } = useGoogleReCaptcha();
  const captchaedFunctions = new CaptchaedFunctions(executeRecaptcha);

  const adminData = useSelector((state) => state.adminData);

  const [usersData, setUsersData] = useState([]);
  const [membersData, setMembersData] = useState([]);

  const dateSorter = (a, b) => new Date(a) > new Date(b);

  const divideHundred = (x) => !x ? null : parseFloat(x / 100)

  const columnsUsers = [
    {
      title: "Applied Date",
      field: "membership_applied",
      sorter: dateSorter,
      width: 250,
    },
    {
      title: "Legal Name",
      field: "real_name",
      headerFilter: "input",
      width: 150,
    },
    { title: "Email", field: "email", headerFilter: "input", width: 150 },
    { title: "Phone", field: "phone", headerFilter: "input", width: 150 },
    { title: "Address", field: "address", headerFilter: "input", width: 150 },
    {
      title: "Motivation",
      field: "membership_motivation",
      headerFilter: "input",
    },
    { title: "Registered", field: "created_at",  sorter: dateSorter },
    { title: "Flagged", field: "flagged", sorter: dateSorter},
    {
      title: "Flag?",
      field: "flagged_true",
      hozAlign: "center",
      formatter: "tickCross",
      editor: true,
    },
    {
      title: "Donation sum",
      field: "donation_fiat_amount_sum",
      headerFilter: "input",
      width: 150,
      mutator:divideHundred,
    },
    {
      title: "Donation count",
      field: "donations_count",
      headerFilter: "input",
      width: 150,
    },
    {
      title: "Cashouts sum",
      field: "cashouts_fiat_amount_sum",
      headerFilter: "input",
      width: 150,
      mutator:divideHundred,
    },
    {
      title: "Cashouts count",
      field: "cashouts_count",
      headerFilter: "input",
      width: 150,
    },
    {
      title: "Withdraws sum",
      field: "withdraws_fiat_amount_sum",
      headerFilter: "input",
      width: 150,
      mutator:divideHundred,
    },
    {
      title: "Withdraws count",
      field: "withdraws_count",
      headerFilter: "input",
      width: 150,
    },
    {
      title: "Public Key",
      field: "curr_public_key",
      headerFilter: "input",
      width: 250,
    },
    {
      title: "Member?",
      field: "member_state",
      hozAlign: "center",
      formatter: "tickCross",
      editor: true,
    },
    {
      title: "hash",
      field: "hash",
    },
  ];

  const columnsMembers = [    
    {
    title: "Membership changed",
    field: "membership_changed",
    sorter: dateSorter,
    width: 250,
  },
  ...columnsUsers,
  ]

  const columns = columnsMembers;

  const options = {
    height: 300,
    movableRows: true,
  };

  const rowClick = (e, row, view) => {
    //console.log("ref table: ", this.ref.table);
    console.log(`rowClick id: ${row.getData().id}`, row, e);
    console.log(row.getData().name);

    dispatch(updatePopupContent({ view, i: row.getData().hash }));
    dispatch(popupFn(POPUP.ADMIN_MEMBER_INFO));
  };

  useEffect(() => {
    if (!utils.getCachedUsersId()) {
      dispatch(popupFn(POPUP.SIGNFORM_ADMIN));
    } else {
      captchaedFunctions.fetchToViewAdminData();
    }
  }, []);

  useEffect(() => {
    if (adminData.usersData) {
      setUsersData(convertToTableData(adminData.usersData));
    }

    if (adminData.membersData) {
      setMembersData(convertToTableData(adminData.membersData));
    }
  }, [adminData]);

  const convertToTableData = (data) =>
    data.map((d) => {
      const newD = {};
      columns.map(
        (c) =>
          (newD[c.field] =
            c.sorter === "date" ? utils.formatDate({date: new Date(d[c.field])}, "date") : d[c.field])
      );
      newD.hash = utils.hashCode(d.users_id);
      newD.flagged_true = !(d.flagged === null);
      return newD;
    });

  return (
    <div>
      <div id="admin-page" className="view-page mb-25">
        {!adminData.usersData ? (
          ""
        ) : (
          <div className="col-12 mb-55 ">
            <h1 className="center">Admin</h1>

            <h3>Applicants</h3>

            <div id="admin-applicants-table" className="mb-25">
              <ReactTabulator
                columns={columnsUsers}
                data={usersData}
                rowClick={(e, row) => rowClick(e, row, "usersData")}
                options={options}
              />
            </div>

            <h3>Members</h3>

            <div id="admin-members-table">
              <ReactTabulator
                columns={columnsMembers}
                data={membersData}
                rowClick={(e, row) => rowClick(e, row, "membersData")}
                options={options}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
