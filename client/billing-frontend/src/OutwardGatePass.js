import React, { useEffect, useState } from "react";

const EMPTY_FORM = {
  inwardId: "",
  contractNo: "",
  customerCode: "",
  customerName: "",
  customerLotNo: "",
  factoryLotNo: "",
  type: "ISSUE",
  dated: ""
};

function OutwardGatePass() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [inwards, setInwards] = useState([]);
  const [qualities, setQualities] = useState([]);
  const [qualityCount, setQualityCount] = useState(0);

  useEffect(() => {
    fetch("http://localhost:8080/inward")
      .then((res) => res.json())
      .then(setInwards)
      .catch(console.error);
  }, []);

  const handleChange = (field, value) => {
    if (field === "inwardId") {
      const selected = inwards.find((item) => item.inwardId === value);

      setForm((prev) => ({
        ...prev,
        inwardId: value,
        contractNo: selected?.contractNo || "",
        customerCode: selected?.customerCode || selected?.partyCode || "",
        customerName: selected?.customerName || selected?.nameOfParty || "",
        customerLotNo: selected?.customerLotNo || "",
        factoryLotNo: selected?.factoryLotNo || ""
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setQualities([]);
    setQualityCount(0);
  };

  const handleQualityCount = (count) => {
    const nextCount = Number.isFinite(count) && count > 0 ? count : 0;
    setQualityCount(nextCount);
    setQualities(
      Array.from({ length: nextCount }, () => ({
        quality: "",
        kg: "",
        roll: ""
      }))
    );
  };

  const handleQualityChange = (index, field, value) => {
    setQualities((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const handleSubmit = () => {
    const payload = {
      ...form,
      items: qualities
    };

    const endpoint =
      form.type === "ISSUE"
        ? "http://localhost:8080/outward/issue"
        : "http://localhost:8080/outward/return";

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then(() => {
        alert(`${form.type} Gate Pass Saved Successfully`);
        resetForm();
      })
      .catch((err) => {
        alert("Error saving outward gate pass");
        console.error(err);
      });
  };

  return (
    <div className="add-party-page">
      <div className="form-container">
        <div className="add-party-header">
          <div className="header-content">
            <h1>Outward Gate Pass</h1>
            <p>Issue or return materials to customers</p>
          </div>
        </div>

        <div className="add-party-form">
          <div className="form-section">
            <h3>Gate Pass Type & Date</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Gate Pass Type <span className="required">*</span></label>
                <select
                  value={form.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                >
                  <option value="ISSUE">Issue to Customer</option>
                  <option value="RETURN">Return from Customer</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={form.dated}
                  onChange={(e) => handleChange("dated", e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label>Inward ID (Reference) <span className="required">*</span></label>
                <select
                  value={form.inwardId}
                  onChange={(e) => handleChange("inwardId", e.target.value)}
                >
                  <option value="">Select Inward</option>
                  {inwards.map((item) => (
                    <option key={item.id || item.inwardId} value={item.inwardId}>
                      {item.inwardId}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Contract & Party Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Contract No</label>
                <input value={form.contractNo} readOnly />
              </div>

              <div className="form-group">
                <label>Customer Code</label>
                <input
                  value={form.customerCode}
                  onChange={(e) => handleChange("customerCode", e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label>Customer Name</label>
                <input
                  value={form.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Lot Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Customer Lot No</label>
                <input
                  value={form.customerLotNo}
                  onChange={(e) => handleChange("customerLotNo", e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label>Factory Lot No</label>
                <input
                  value={form.factoryLotNo}
                  onChange={(e) => handleChange("factoryLotNo", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Quality Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Number of Qualities</label>
                <input
                  type="number"
                  min="0"
                  value={qualityCount}
                  onChange={(e) => handleQualityCount(Number.parseInt(e.target.value || "0", 10))}
                />
              </div>
            </div>
          </div>

          {qualityCount > 0 && (
            <div className="form-section">
              <h3>Quality Items ({qualityCount})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {qualities.map((quality, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "15px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "6px",
                      border: "1px solid #e0e0e0"
                    }}
                  >
                    <p style={{ margin: "0 0 15px 0", fontWeight: "600", color: "#2c3e50" }}>
                      Quality #{index + 1}
                    </p>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Quality</label>
                        <input
                          placeholder="Enter quality"
                          value={quality.quality}
                          onChange={(e) => handleQualityChange(index, "quality", e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>KG</label>
                        <input
                          type="number"
                          placeholder="Enter weight"
                          value={quality.kg}
                          onChange={(e) => handleQualityChange(index, "kg", e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Rolls</label>
                        <input
                          type="number"
                          placeholder="Enter rolls"
                          value={quality.roll}
                          onChange={(e) => handleQualityChange(index, "roll", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-buttons">
            <button className="btn-submit" onClick={handleSubmit}>
              Save Outward Gate Pass
            </button>
            <button className="btn-reset" onClick={resetForm}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutwardGatePass;
