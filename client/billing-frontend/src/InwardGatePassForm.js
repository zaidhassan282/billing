import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./InwardGatePassForm.css";
import { API_URL } from "./config";

const ROW_COUNT = 15;

function InwardGatePassForm() {
  const [form, setForm] = useState({
    gatePassNo: "",
    dated: "",
    supplierName: "",
    receivedFrom: "",
    vehicleNo: "",
    driverName: "",
    referenceChallan: "",
    fabricType: "GREY",
    gateInTime: "",
    securityGuard: "",
    receivedCheckedBy: "",
    receivedByName: "",
    receivedByDesignation: "",
    receivedByDate: "",
    storeName: "",
    storeSignature: "",
    storeDate: "",
    authorizedName: "",
    authorizedDesignation: "",
    authorizedDate: ""
  });

  const [contracts, setContracts] = useState([]);
  const [items, setItems] = useState(
    Array.from({ length: ROW_COUNT }, () => ({
      description: "",
      color: "",
      design: "",
      rolls: "",
      weight: "",
      meters: "",
      remarks: ""
    }))
  );

  useEffect(() => {
    fetch(`${API_URL}/contracts/all`)
      .then(res => res.json())
      .then(setContracts)
      .catch(console.error);
  }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;
    setItems(updated);
  };

  const calcTotal = (field) =>
    items.reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0).toFixed(2);

  const handleSave = () => {
    const filteredItems = items.filter(
      item => item.description || item.weight || item.rolls
    );

    const payload = {
      inwardId: form.gatePassNo,
      dated: form.dated,
      contractNo: form.referenceChallan,
      nameOfParty: form.supplierName,
      partyCode: "",
      customerLotNo: "",
      factoryLotNo: "",
      vehicleNo: form.vehicleNo,
      items: filteredItems.map(item => ({
        quality: item.description,
        color: item.color,
        kg: parseFloat(item.weight) || 0,
        roll: parseInt(item.rolls) || 0
      }))
    };

    fetch(`${API_URL}/inward`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => alert("Inward Gate Pass Saved Successfully"))
      .catch(err => {
        alert("Error saving inward gate pass");
        console.error(err);
      });
  };

  const downloadPDF = () => {
    const input = document.getElementById("inward-gatepass-doc");
    html2canvas(input, { scale: 3, backgroundColor: "#ffffff" }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const imgWidth = pageWidth - 10;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 5, 5, imgWidth, imgHeight);
      pdf.save(`InwardGatePass_${form.gatePassNo || "draft"}.pdf`);
    });
  };

  const printDoc = () => {
    window.print();
  };

  return (
    <div className="igp-wrapper">
      {/* ACTION BUTTONS */}
      <div className="igp-actions">
        <button className="igp-btn igp-btn-save" onClick={handleSave}>💾 Save</button>
        <button className="igp-btn igp-btn-print" onClick={printDoc}>🖨️ Print</button>
        <button className="igp-btn igp-btn-pdf" onClick={downloadPDF}>📄 Download PDF</button>
      </div>

      {/* PRINTABLE DOCUMENT */}
      <div id="inward-gatepass-doc" className="igp-doc">

        {/* HEADER */}
        <div className="igp-header">
          <div className="igp-header-left">
            <div className="igp-logo-placeholder" title="Logo will be uploaded later">
              <span className="igp-logo-text">FINE<br/>FUSION<br/>TEXTILE</span>
              <small className="igp-logo-hint">[ logo ]</small>
            </div>
            <div className="igp-company-name">
              <strong>FINE FUSION TEXTILE</strong>
            </div>
          </div>
          <div className="igp-header-right">
            <h1 className="igp-title">INWARD GATE PASS</h1>
          </div>
        </div>

        {/* ADDRESS BAR */}
        <div className="igp-address-bar">
          Plot A-15/B, Binoria Chowk, SITE, Karachi | 0315-1113223 | finefusiontextile@gmail.com
        </div>

        {/* TOP FIELDS */}
        <div className="igp-top-fields">
          <div className="igp-top-field">
            <div className="igp-top-label">GATE PASS NO.</div>
            <input
              type="text"
              className="igp-top-input"
              value={form.gatePassNo}
              onChange={e => handleChange("gatePassNo", e.target.value)}
            />
          </div>
          <div className="igp-top-field">
            <div className="igp-top-label">DATE</div>
            <input
              type="date"
              className="igp-top-input"
              value={form.dated}
              onChange={e => handleChange("dated", e.target.value)}
            />
          </div>
        </div>

        {/* PARTY DETAILS SECTION */}
        <div className="igp-section-header">PARTY / DETAILS</div>
        <div className="igp-section-body">
          <div className="igp-row">
            <div className="igp-row-label">Supplier / Party Name</div>
            <input
              type="text"
              className="igp-row-input"
              value={form.supplierName}
              onChange={e => handleChange("supplierName", e.target.value)}
            />
          </div>
          <div className="igp-row">
            <div className="igp-row-label">Received From (Address)</div>
            <input
              type="text"
              className="igp-row-input"
              value={form.receivedFrom}
              onChange={e => handleChange("receivedFrom", e.target.value)}
            />
          </div>
          <div className="igp-row">
            <div className="igp-row-label">Vehicle No. / Transporter</div>
            <input
              type="text"
              className="igp-row-input"
              value={form.vehicleNo}
              onChange={e => handleChange("vehicleNo", e.target.value)}
            />
          </div>
          <div className="igp-row">
            <div className="igp-row-label">Driver Name / Contact</div>
            <input
              type="text"
              className="igp-row-input"
              value={form.driverName}
              onChange={e => handleChange("driverName", e.target.value)}
            />
          </div>
          <div className="igp-row">
            <div className="igp-row-label">Reference Challan / PO No.</div>
            <input
              type="text"
              className="igp-row-input"
              value={form.referenceChallan}
              onChange={e => handleChange("referenceChallan", e.target.value)}
            />
          </div>
        </div>

        {/* FABRIC DETAILS SECTION */}
        <div className="igp-section-header">FABRIC DETAILS</div>
        <div className="igp-fabric-type-row">
          <div className="igp-fabric-type-label">Fabric Type</div>
          <label className={`igp-radio-label ${form.fabricType === "DYED" ? "active" : ""}`}>
            <input
              type="radio"
              name="fabricType"
              value="DYED"
              checked={form.fabricType === "DYED"}
              onChange={() => handleChange("fabricType", "DYED")}
            />
            <span className="igp-radio-custom"></span>
            <strong>DYED FABRIC</strong>
          </label>
          <label className={`igp-radio-label ${form.fabricType === "GREY" ? "active" : ""}`}>
            <input
              type="radio"
              name="fabricType"
              value="GREY"
              checked={form.fabricType === "GREY"}
              onChange={() => handleChange("fabricType", "GREY")}
            />
            <span className="igp-radio-custom"></span>
            <strong>GREY FABRIC</strong>
          </label>
        </div>

        {/* ITEMS TABLE */}
        <table className="igp-items-table">
          <thead>
            <tr>
              <th className="igp-col-no">#</th>
              <th>Description / Quality</th>
              <th>Color / Shade</th>
              <th>Design / Article</th>
              <th>No. of Rolls/Bags</th>
              <th>Weight (KGs)</th>
              <th>Meters / Yards</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td className="igp-col-no">{i + 1}</td>
                <td>
                  <input
                    type="text"
                    className="igp-cell-input"
                    value={item.description}
                    onChange={e => handleItemChange(i, "description", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="igp-cell-input"
                    value={item.color}
                    onChange={e => handleItemChange(i, "color", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="igp-cell-input"
                    value={item.design}
                    onChange={e => handleItemChange(i, "design", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="igp-cell-input igp-cell-number"
                    value={item.rolls}
                    onChange={e => handleItemChange(i, "rolls", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="igp-cell-input igp-cell-number"
                    value={item.weight}
                    onChange={e => handleItemChange(i, "weight", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="igp-cell-input igp-cell-number"
                    value={item.meters}
                    onChange={e => handleItemChange(i, "meters", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="igp-cell-input"
                    value={item.remarks}
                    onChange={e => handleItemChange(i, "remarks", e.target.value)}
                  />
                </td>
              </tr>
            ))}
            <tr className="igp-total-row">
              <td colSpan="4" className="igp-total-label">TOTAL</td>
              <td className="igp-total-value">{calcTotal("rolls")}</td>
              <td className="igp-total-value">{calcTotal("weight")}</td>
              <td className="igp-total-value">{calcTotal("meters")}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* SECURITY SECTION */}
        <div className="igp-section-header">SECURITY / GATE CHECKING</div>
        <div className="igp-section-body">
          <div className="igp-row">
            <div className="igp-row-label">Gate In Time</div>
            <input
              type="text"
              className="igp-row-input"
              value={form.gateInTime}
              onChange={e => handleChange("gateInTime", e.target.value)}
            />
          </div>
          <div className="igp-row">
            <div className="igp-row-label">Security Guard Name</div>
            <input
              type="text"
              className="igp-row-input"
              value={form.securityGuard}
              onChange={e => handleChange("securityGuard", e.target.value)}
            />
          </div>
          <div className="igp-row">
            <div className="igp-row-label">Received & Checked By</div>
            <input
              type="text"
              className="igp-row-input"
              value={form.receivedCheckedBy}
              onChange={e => handleChange("receivedCheckedBy", e.target.value)}
            />
          </div>
        </div>

        {/* SIGNATURES SECTION */}
        <div className="igp-signatures">
          <div className="igp-signature-col">
            <div className="igp-signature-header">RECEIVED BY</div>
            <div className="igp-signature-body">
              <div className="igp-sig-line">
                <span className="igp-sig-label">Name:</span>
                <input
                  type="text"
                  className="igp-sig-input"
                  value={form.receivedByName}
                  onChange={e => handleChange("receivedByName", e.target.value)}
                />
              </div>
              <div className="igp-sig-line">
                <span className="igp-sig-label">Designation:</span>
                <input
                  type="text"
                  className="igp-sig-input"
                  value={form.receivedByDesignation}
                  onChange={e => handleChange("receivedByDesignation", e.target.value)}
                />
              </div>
              <div className="igp-sig-line">
                <span className="igp-sig-label">Date:</span>
                <input
                  type="text"
                  className="igp-sig-input"
                  value={form.receivedByDate}
                  onChange={e => handleChange("receivedByDate", e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="igp-signature-col">
            <div className="igp-signature-header">STORE / WAREHOUSE</div>
            <div className="igp-signature-body">
              <div className="igp-sig-line">
                <span className="igp-sig-label">Name:</span>
                <input
                  type="text"
                  className="igp-sig-input"
                  value={form.storeName}
                  onChange={e => handleChange("storeName", e.target.value)}
                />
              </div>
              <div className="igp-sig-line">
                <span className="igp-sig-label">Signature:</span>
                <input
                  type="text"
                  className="igp-sig-input"
                  value={form.storeSignature}
                  onChange={e => handleChange("storeSignature", e.target.value)}
                />
              </div>
              <div className="igp-sig-line">
                <span className="igp-sig-label">Date:</span>
                <input
                  type="text"
                  className="igp-sig-input"
                  value={form.storeDate}
                  onChange={e => handleChange("storeDate", e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="igp-signature-col">
            <div className="igp-signature-header">AUTHORIZED SIGNATORY</div>
            <div className="igp-signature-body">
              <div className="igp-sig-line">
                <span className="igp-sig-label">Name:</span>
                <input
                  type="text"
                  className="igp-sig-input"
                  value={form.authorizedName}
                  onChange={e => handleChange("authorizedName", e.target.value)}
                />
              </div>
              <div className="igp-sig-line">
                <span className="igp-sig-label">Designation & Stamp:</span>
                <input
                  type="text"
                  className="igp-sig-input"
                  value={form.authorizedDesignation}
                  onChange={e => handleChange("authorizedDesignation", e.target.value)}
                />
              </div>
              <div className="igp-sig-line">
                <span className="igp-sig-label">Date:</span>
                <input
                  type="text"
                  className="igp-sig-input"
                  value={form.authorizedDate}
                  onChange={e => handleChange("authorizedDate", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER NOTE */}
        <div className="igp-footer-note">
          This gatepass must be retained for record. All issued goods must be verified before storage. | Fine Fusion Textile
        </div>

      </div>
    </div>
  );
}

export default InwardGatePassForm;
