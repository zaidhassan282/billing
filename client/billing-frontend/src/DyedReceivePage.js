import React, { useState } from "react";
import { API_URL } from "./config";

function DyedReceivePage() {
  const [form, setForm] = useState({
    dated: "",
    contractNo: "",
    partyCode: "",
    nameOfParty: "",
    customerLotNo: "",
    factoryLotNo: "",
    quality: "",
    quantityKg: "",
    cutPiecesKg: "",
    shrinkage: ""
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = () => {
    const payload = {
      ...form,
      quantityKg: parseFloat(form.quantityKg),
      cutPiecesKg: parseFloat(form.cutPiecesKg),
      shrinkage: parseFloat(form.shrinkage)
    };

    fetch(`${API_URL}/dyed/receive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        alert("Dyed Fabric Received Successfully");
        setForm({
          dated: "",
          contractNo: "",
          partyCode: "",
          nameOfParty: "",
          customerLotNo: "",
          factoryLotNo: "",
          quality: "",
          quantityKg: "",
          cutPiecesKg: "",
          shrinkage: ""
        });
      })
      .catch(err => {
        alert("Error receiving dyed fabric");
        console.error(err);
      });
  };

  return (
    <div className="add-party-page">
      <div className="form-container">
        <div className="add-party-header">
          <div className="header-content">
            <h1>Dyed Fabric Receive</h1>
            <p>Record receipt of dyed fabric from dyeing facility</p>
          </div>
        </div>

        <div className="add-party-form">
          {/* BASIC DETAILS */}
          <div className="form-section">
            <h3>Basic Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={form.dated}
                  onChange={e => handleChange("dated", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Contract No <span className="required">*</span></label>
                <input
                  value={form.contractNo}
                  onChange={e => handleChange("contractNo", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Party Code</label>
                <input
                  value={form.partyCode}
                  onChange={e => handleChange("partyCode", e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label>Name of Party</label>
                <input
                  value={form.nameOfParty}
                  onChange={e => handleChange("nameOfParty", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* LOT DETAILS */}
          <div className="form-section">
            <h3>Lot Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Customer Lot No</label>
                <input
                  value={form.customerLotNo}
                  onChange={e => handleChange("customerLotNo", e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label>Factory Lot No</label>
                <input
                  value={form.factoryLotNo}
                  onChange={e => handleChange("factoryLotNo", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* FABRIC DETAILS */}
          <div className="form-section">
            <h3>Fabric Details</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Quality <span className="required">*</span></label>
                <input
                  placeholder="Enter quality/description"
                  value={form.quality}
                  onChange={e => handleChange("quality", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Received Quantity (KG) <span className="required">*</span></label>
                <input
                  type="number"
                  placeholder="Enter received quantity"
                  value={form.quantityKg}
                  onChange={e => handleChange("quantityKg", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Cut Pieces (KG)</label>
                <input
                  type="number"
                  placeholder="Enter cut pieces quantity"
                  value={form.cutPiecesKg}
                  onChange={e => handleChange("cutPiecesKg", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Shrinkage (KG)</label>
                <input
                  type="number"
                  placeholder="Enter shrinkage quantity"
                  value={form.shrinkage}
                  onChange={e => handleChange("shrinkage", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="form-buttons">
            <button className="btn-submit" onClick={handleSubmit}>
              Save Dyed Receipt
            </button>
            <button className="btn-reset" onClick={() => {
              setForm({
                dated: "",
                contractNo: "",
                partyCode: "",
                nameOfParty: "",
                customerLotNo: "",
                factoryLotNo: "",
                quality: "",
                quantityKg: "",
                cutPiecesKg: "",
                shrinkage: ""
              });
            }}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DyedReceivePage;
