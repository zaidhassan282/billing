import React, { useState } from "react";

function GreighReceipt() {
  const [data, setData] = useState([]);

  const addRow = () => {
    setData([
      ...data,
      {
        dated: "",
        customerCode: "",
        customerName: "",
        customerLotNo: ""
      }
    ]);
  };

  const handleChange = (i, field, value) => {
    const updated = [...data];
    updated[i][field] = value;
    setData(updated);
  };

  return (
    <div className="greigh-receipt-page">
      
      {/* HEADER */}
      <div className="greigh-receipt-header">
        <div className="header-content">
          <h1>Greigh Receipt</h1>
          <p>Manage customer weigh receipt records</p>
        </div>
        <button onClick={addRow} className="btn-add-row">
          <span>+</span> Add New Receipt
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="greigh-receipt-table">
            <thead>
              <tr>
                <th>Dated</th>
                <th>Customer Code</th>
                <th>Customer Name</th>
                <th>Customer Lot No.</th>
              </tr>
            </thead>

            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td><input type="date" value={row.dated || ""} onChange={e => handleChange(i, "dated", e.target.value)} placeholder="Select date" /></td>
                  <td><input type="text" value={row.customerCode || ""} onChange={e => handleChange(i, "customerCode", e.target.value)} placeholder="Customer code" /></td>
                  <td><input type="text" value={row.customerName || ""} onChange={e => handleChange(i, "customerName", e.target.value)} placeholder="Customer name" /></td>
                  <td><input type="text" value={row.customerLotNo || ""} onChange={e => handleChange(i, "customerLotNo", e.target.value)} placeholder="Lot no." /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GreighReceipt;