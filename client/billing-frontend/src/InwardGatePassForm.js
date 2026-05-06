import React, { useState, useEffect } from "react";

function InwardPage() {
  const [form, setForm] = useState({
    contractNo: "",
    partyCode: "",
    nameOfParty: "",
    customerLotNo: "",
    factoryLotNo: "",
    vehicleNo: "",
    dated: ""
  });

  const [contracts, setContracts] = useState([]);
  const [qualities, setQualities] = useState([]);
  const [qualityCount, setQualityCount] = useState(0);

  useEffect(() => {
    fetch("http://localhost:8080/contracts/all")
      .then(res => res.json())
      .then(setContracts)
      .catch(console.error);
  }, []);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });

    if (field === "contractNo") {
      const selected = contracts.find(c => c.contractNo === value);
      if (selected) {
        setForm(prev => ({
          ...prev,
          contractNo: value,
          partyCode: selected.partyCode,
          nameOfParty: selected.nameOfParty
        }));
      }
    }
  };

  const handleQualityCount = (count) => {
    setQualityCount(count);
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        quality: "",
        color: "",
        kg: "",
        roll: ""
      });
    }
    setQualities(arr);
  };

  const handleQualityChange = (i, field, value) => {
    const updated = [...qualities];
    updated[i][field] = value;
    setQualities(updated);
  };

  const handleSubmit = () => {
    const payload = {
      ...form,
      items: qualities
    };

    fetch("http://localhost:8080/inward", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        alert("Inward Gate Pass Saved Successfully");
        setForm({
          contractNo: "",
          partyCode: "",
          nameOfParty: "",
          customerLotNo: "",
          factoryLotNo: "",
          vehicleNo: "",
          dated: ""
        });
        setQualities([]);
        setQualityCount(0);
      })
      .catch(err => {
        alert("Error saving inward gate pass");
        console.error(err);
      });
  };

  return (
    <div className="add-party-page">
      <div className="form-container">
        <div className="add-party-header">
          <div className="header-content">
            <h1>Inward Gate Pass</h1>
            <p>Receive greigh material from suppliers</p>
          </div>
        </div>

        <div className="add-party-form">
          {/* BASIC DETAILS SECTION */}
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
                <select
                  value={form.contractNo}
                  onChange={e => handleChange("contractNo", e.target.value)}
                >
                  <option value="">Select Contract</option>
                  {contracts.map(c => (
                    <option key={c.id} value={c.contractNo}>
                      {c.contractNo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Party Code</label>
                <input value={form.partyCode} readOnly />
              </div>

              <div className="form-group full-width">
                <label>Name of Party</label>
                <input value={form.nameOfParty} readOnly />
              </div>
            </div>
          </div>

          {/* LOT DETAILS SECTION */}
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

              <div className="form-group">
                <label>Factory Lot No</label>
                <input
                  value={form.factoryLotNo}
                  onChange={e => handleChange("factoryLotNo", e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label>Vehicle No</label>
                <input
                  value={form.vehicleNo}
                  onChange={e => handleChange("vehicleNo", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* QUALITY COUNT SECTION */}
          <div className="form-section">
            <h3>Quality Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Number of Qualities</label>
                <input
                  type="number"
                  value={qualityCount}
                  onChange={e => handleQualityCount(parseInt(e.target.value || 0))}
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC QUALITIES */}
          {qualityCount > 0 && (
            <div className="form-section">
              <h3>Quality Items ({qualityCount})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {qualities.map((q, i) => (
                  <div key={i} style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                    <p style={{ margin: '0 0 15px 0', fontWeight: '600', color: '#2c3e50' }}>Quality #{i + 1}</p>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Quality</label>
                        <input
                          placeholder="Enter quality"
                          value={q.quality}
                          onChange={e => handleQualityChange(i, "quality", e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Color</label>
                        <input
                          placeholder="Enter color"
                          value={q.color}
                          onChange={e => handleQualityChange(i, "color", e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>KG</label>
                        <input
                          type="number"
                          placeholder="Enter weight"
                          value={q.kg}
                          onChange={e => handleQualityChange(i, "kg", e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Rolls</label>
                        <input
                          type="number"
                          placeholder="Enter rolls"
                          value={q.roll}
                          onChange={e => handleQualityChange(i, "roll", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BUTTONS */}
          <div className="form-buttons">
            <button className="btn-submit" onClick={handleSubmit}>
              Save Inward Gate Pass
            </button>
            <button className="btn-reset" onClick={() => {
              setForm({ contractNo: "", partyCode: "", nameOfParty: "", customerLotNo: "", factoryLotNo: "", vehicleNo: "", dated: "" });
              setQualities([]);
              setQualityCount(0);
            }}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InwardPage;
