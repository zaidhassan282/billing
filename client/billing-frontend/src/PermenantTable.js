import React, { useState, useEffect } from "react";
import "./PermenantTable.css";
import Toast from "./Toast";

function PermanentTable() {
  const [data, setData] = useState([]);
  const [deletedStack, setDeletedStack] = useState([]);
  const [search, setSearch] = useState("");
  const [filterGST, setFilterGST] = useState("");
  const [toast, setToast] = useState(null);

  // 🔹 Load from backend
  useEffect(() => {
    fetch("http://localhost:8080/permanent-table")
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // 🔹 Add row
  const addRow = () => {
    setData([
      ...data,
      {
        partyCode: "",
        nameOfParty: "",
        invoiceAddress: "",
        ntn: "",
        gstInvoice: "",
        deliveryAddress1: "",
        deliveryAddress2: "",
        deliveryAddress3: ""
      }
    ]);
  };

  // 🔹 Handle input change
  const handleChange = (i, field, value) => {
    const updated = [...data];
    updated[i][field] = value;
    setData(updated);
  };

  // 🔹 Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // 🔹 Save ALL rows
  const saveAll = async () => {
    for (let row of data) {
      // 🔴 Duplicate check (frontend)
      const duplicate = data.filter(
        r =>
          r !== row &&
          (r.ntn === row.ntn || r.nameOfParty === row.nameOfParty)
      );

      if (duplicate.length > 0) {
        showToast("Duplicate Name or NTN not allowed", "error");
        return;
      }

      await fetch("http://localhost:8080/permanent-table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(row)
      });
    }

    showToast("Saved successfully", "success");
  };

  // 🔹 Delete row
  const deleteRow = (index) => {
    const row = data[index];

    setDeletedStack([...deletedStack, row]); // push to undo stack

    const updated = data.filter((_, i) => i !== index);
    setData(updated);
  };

  // 🔹 Undo delete
  const undoDelete = () => {
    if (deletedStack.length === 0) return;

    const last = deletedStack[deletedStack.length - 1];
    setData([...data, last]);

    setDeletedStack(deletedStack.slice(0, -1));
  };

  // 🔹 Search + Filter
  const filteredData = data.filter(row => {
    const matchesSearch =
      row.nameOfParty?.toLowerCase().includes(search.toLowerCase()) ||
      row.ntn?.toLowerCase().includes(search.toLowerCase()) ||
      row.partyCode?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filterGST === "" || row.gstInvoice === filterGST;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="permanent-table-page">

      {/* TOAST NOTIFICATION */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <div className="permanent-header">
        <div className="header-content">
          <h1>Permanent Party Table</h1>
          <p>Manage party information and delivery addresses</p>
        </div>

        <div className="header-buttons">
          <button onClick={addRow} className="btn-add-row">
            <span>+</span> Add New Party
          </button>

          <button onClick={saveAll} className="btn-save">
            <span>💾</span> Save All
          </button>

          <button onClick={undoDelete} className="btn-undo">
            <span>↶</span> Undo
          </button>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="table-controls">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search by Name / NTN / Code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={filterGST}
          onChange={(e) => setFilterGST(e.target.value)}
        >
          <option value="">All GST</option>
          <option value="Yes">GST Yes</option>
          <option value="No">GST No</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="permanent-table">
            <thead>
              <tr>
                <th>Party Code</th>
                <th>Name of Party</th>
                <th>Invoice Address</th>
                <th>NTN</th>
                <th>GST Invoice</th>
                <th>Delivery Address 1</th>
                <th>Delivery Address 2</th>
                <th>Delivery Address 3</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((row, i) => (
                <tr key={i}>
                  <td><input type="text" value={row.partyCode || ""} onChange={e => handleChange(i, "partyCode", e.target.value)} placeholder="Enter code" /></td>
                  <td><input type="text" value={row.nameOfParty || ""} onChange={e => handleChange(i, "nameOfParty", e.target.value)} placeholder="Enter name" /></td>
                  <td><input type="text" value={row.invoiceAddress || ""} onChange={e => handleChange(i, "invoiceAddress", e.target.value)} placeholder="Enter address" /></td>
                  <td><input type="text" value={row.ntn || ""} onChange={e => handleChange(i, "ntn", e.target.value)} placeholder="Enter NTN" /></td>
                  <td><select value={row.gstInvoice || ""} onChange={e => handleChange(i, "gstInvoice", e.target.value)} className="gst-select"><option value="">Select GST</option><option value="Yes">Yes</option><option value="No">No</option></select></td>
                  <td><input type="text" value={row.deliveryAddress1 || ""} onChange={e => handleChange(i, "deliveryAddress1", e.target.value)} placeholder="Address 1" /></td>
                  <td><input type="text" value={row.deliveryAddress2 || ""} onChange={e => handleChange(i, "deliveryAddress2", e.target.value)} placeholder="Address 2" /></td>
                  <td><input type="text" value={row.deliveryAddress3 || ""} onChange={e => handleChange(i, "deliveryAddress3", e.target.value)} placeholder="Address 3" /></td>

                  <td>
                    <button onClick={() => deleteRow(i)} className="btn-delete">🗑 Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}

export default PermanentTable;