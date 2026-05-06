import React, { useState } from "react";

function ReceiptsTable() {
  const [data, setData] = useState([]);

  const addRow = () => {
    setData([
      ...data,
      {
        sNo: "",
        dated: "",
        partyCode: "",
        nameOfParty: "",
        commercialBillNo: "",
        gstInvoiceNo: "",
        chequeOrCash: "",
        chequeDate: "",
        chequeAmount: ""
      }
    ]);
  };

  const handleChange = (i, field, value) => {
    const updated = [...data];
    updated[i][field] = value;
    setData(updated);
  };

  return (
    <div className="receipts-table-page">
      
      {/* HEADER */}
      <div className="receipts-header">
        <div className="header-content">
          <h1>Receipts Table</h1>
          <p>Manage receipt records and payment details</p>
        </div>
        <button onClick={addRow} className="btn-add-row">
          <span>+</span> Add New Receipt
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="receipts-table">
            <thead>
              <tr>
                <th>S. No.</th>
                <th>Dated</th>
                <th>Party Code</th>
                <th>Name of Party</th>
                <th>Commercial Bill No.</th>
                <th>GST Invoice No.</th>
                <th>Cheque/Cash</th>
                <th>Cheque Date</th>
                <th>Cheque Amount</th>
              </tr>
            </thead>

            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td><input type="text" value={row.sNo || ""} onChange={e => handleChange(i, "sNo", e.target.value)} placeholder="S. No." /></td>
                  <td><input type="date" value={row.dated || ""} onChange={e => handleChange(i, "dated", e.target.value)} placeholder="Select date" /></td>
                  <td><input type="text" value={row.partyCode || ""} onChange={e => handleChange(i, "partyCode", e.target.value)} placeholder="Party code" /></td>
                  <td><input type="text" value={row.nameOfParty || ""} onChange={e => handleChange(i, "nameOfParty", e.target.value)} placeholder="Party name" /></td>
                  <td><input type="text" value={row.commercialBillNo || ""} onChange={e => handleChange(i, "commercialBillNo", e.target.value)} placeholder="Bill no." /></td>
                  <td><input type="text" value={row.gstInvoiceNo || ""} onChange={e => handleChange(i, "gstInvoiceNo", e.target.value)} placeholder="Invoice no." /></td>
                  <td><input type="text" value={row.chequeOrCash || ""} onChange={e => handleChange(i, "chequeOrCash", e.target.value)} placeholder="Cheque/Cash" /></td>
                  <td><input type="date" value={row.chequeDate || ""} onChange={e => handleChange(i, "chequeDate", e.target.value)} placeholder="Cheque date" /></td>
                  <td><input type="number" value={row.chequeAmount || ""} onChange={e => handleChange(i, "chequeAmount", e.target.value)} placeholder="Amount" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReceiptsTable;