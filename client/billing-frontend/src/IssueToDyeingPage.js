import React, { useState, useEffect } from "react";

function IssueToDyeingPage() {
  const [form, setForm] = useState({
    inwardId: "",
    quality: "",
    qtyKg: ""
  });

  const [inwards, setInwards] = useState([]);
  const [selectedInward, setSelectedInward] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/inward")
      .then(res => res.json())
      .then(setInwards)
      .catch(console.error);
  }, []);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });

    if (field === "inwardId") {
      const selected = inwards.find(i => i.inwardId === value);
      setSelectedInward(selected);
    }
  };

  const handleSubmit = () => {
    const payload = {
      inwardId: form.inwardId,
      quality: form.quality,
      qtyKg: parseFloat(form.qtyKg)
    };

    fetch("http://localhost:8080/dyeing/issue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        alert("Material Issued to Dyeing Successfully");
        setForm({ inwardId: "", quality: "", qtyKg: "" });
        setSelectedInward(null);
      })
      .catch(err => {
        alert("Error issuing to dyeing");
        console.error(err);
      });
  };

  return (
    <div className="add-party-page">
      <div className="form-container">
        <div className="add-party-header">
          <div className="header-content">
            <h1>Issue to Dyeing</h1>
            <p>Issue greigh material to dyeing facility</p>
          </div>
        </div>

        <div className="add-party-form">
          {/* INWARD SELECTION */}
          <div className="form-section">
            <h3>Select Greigh Material</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Inward ID <span className="required">*</span></label>
                <select
                  value={form.inwardId}
                  onChange={e => handleChange("inwardId", e.target.value)}
                >
                  <option value="">Select Inward</option>
                  {inwards.map(i => (
                    <option key={i.id} value={i.inwardId}>
                      {i.inwardId} - {i.contractNo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* INWARD DETAILS */}
          {selectedInward && (
            <div className="form-section">
              <h3>Inward Details</h3>
              <div style={{ padding: '20px', backgroundColor: '#f0f5ff', borderRadius: '8px', border: '1px solid #d4e6ff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: '600', color: '#666' }}>CONTRACT NO</p>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>{selectedInward.contractNo}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: '600', color: '#666' }}>PARTY</p>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>{selectedInward.nameOfParty}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: '600', color: '#666' }}>CUSTOMER LOT</p>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>{selectedInward.customerLotNo}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: '600', color: '#666' }}>FACTORY LOT</p>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>{selectedInward.factoryLotNo}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QUALITY & QUANTITY */}
          <div className="form-section">
            <h3>Issue Details</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Quality <span className="required">*</span></label>
                <input
                  placeholder="Enter quality/description"
                  value={form.quality}
                  onChange={e => handleChange("quality", e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label>Quantity (KG) <span className="required">*</span></label>
                <input
                  type="number"
                  placeholder="Enter quantity in KG"
                  value={form.qtyKg}
                  onChange={e => handleChange("qtyKg", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="form-buttons">
            <button className="btn-submit" onClick={handleSubmit}>
              Issue to Dyeing
            </button>
            <button className="btn-reset" onClick={() => {
              setForm({ inwardId: "", quality: "", qtyKg: "" });
              setSelectedInward(null);
            }}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueToDyeingPage;
