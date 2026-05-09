import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./OutwardGatePass.css";
import { API_URL } from "./config";

const ROW_COUNT = 15;

function OutwardGatePass() {
  const [form, setForm] = useState({
    gatePassNo: "",
    dated: "",
    type: "DELIVERY",        // DELIVERY | RETURN
    fabricType: "GREY",      // DYED | GREY
    customerName: "",
    deliveryAddress: "",
    vehicleNo: "",
    driverName: "",
    referenceInvoice: "",
    gateOutTime: "",
    securityGuard: "",
    checkedByStore: "",
    issuedByName: "",
    issuedByDesignation: "",
    issuedByDate: "",
    storeName: "",
    storeSignature: "",
    storeDate: "",
    authorizedName: "",
    authorizedDesignation: "",
    authorizedDate: ""
  });

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
      outwardId: form.gatePassNo,
      dated: form.dated,
      type: form.type,
      customerName: form.customerName,
      contractNo: form.referenceInvoice,
      customerLotNo: "",
      factoryLotNo: "",
      items: filteredItems.map(item => ({
        quality: item.description,
        kg: parseFloat(item.weight) || 0,
        roll: parseInt(item.rolls) || 0
      }))
    };

    const endpoint =
      form.type === "DELIVERY"
        ? `${API_URL}/outward/issue`
        : `${API_URL}/outward/return`;

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => alert(`${form.type} Gate Pass Saved Successfully`))
      .catch(err => {
        alert("Error saving outward gate pass");
        console.error(err);
      });
  };

  const downloadPDF = () => {
    const input = document.getElementById("outward-gatepass-doc");
    html2canvas(input, { scale: 3, backgroundColor: "#ffffff" }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const imgWidth = pageWidth - 10;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 5, 5, imgWidth, imgHeight);
      pdf.save(`OutwardGatePass_${form.gatePassNo || "draft"}.pdf`);
    });
  };

  const printDoc = () => {
    window.print();
  };

  return (
    <div className="ogp-wrapper">
      {/* ACTION BUTTONS (hidden when printing) */}
      <div className="ogp-actions">
        <button className="ogp-btn ogp-btn-save" onClick={handleSave}>💾 Save</button>
        <button className="ogp-btn ogp-btn-print" onClick={printDoc}>🖨️ Print</button>
        <button className="ogp-btn ogp-btn-pdf" onClick={downloadPDF}>📄 Download PDF</button>
      </div>

      {/* PRINTABLE DOCUMENT */}
      <div id="outward-gatepass-doc" className="ogp-doc">

        {/* HEADER */}
        <div className="ogp-header">
          <div className="ogp-header-left">
            <div className="ogp-logo-placeholder" title="Logo will be uploaded later">
              <span className="ogp-logo-text">FINE<br/>FUSION<br/>TEXTILE</span>
              <small className="ogp-logo-hint">[ logo ]</small>
            </div>
            <div className="ogp-company-name">
              <strong>FINE FUSION TEXTILE</strong>
            </div>
          </div>
          <div className="ogp-header-right">
            <h1 className="ogp-title">OUTWARD GATE PASS</h1>
          </div>
        </div>

        {/* ADDRESS BAR */}
        <div className="ogp-address-bar">
          Plot A-15/B, Binoria Chowk, SITE, Karachi | 0315-1113223 | finefusiontextile@gmail.com
        </div>

        {/* TYPE SELECTOR (DELIVERY / RETURN) */}
        <div className="ogp-type-row">
          <div className="ogp-type-label">PASS TYPE</div>
          <label className={`ogp-radio-label ${form.type === "DELIVERY" ? "active" : ""}`}>
            <input
              type="radio"
              name="passType"
              value="DELIVERY"
              checked={form.type === "DELIVERY"}
              onChange={() => handleChange("type", "DELIVERY")}
            />
            <span className="ogp-radio-custom"></span>
            <strong>DELIVERY</strong>
          </label>
          <label className={`ogp-radio-label ${form.type === "RETURN" ? "active" : ""}`}>
            <input
              type="radio"
              name="passType"
              value="RETURN"
              checked={form.type === "RETURN"}
              onChange={() => handleChange("type", "RETURN")}
            />
            <span className="ogp-radio-custom"></span>
            <strong>RETURN</strong>
          </label>
        </div>

        {/* TOP FIELDS */}
        <div className="ogp-top-fields">
          <div className="ogp-top-field">
            <div className="ogp-top-label">GATE PASS NO.</div>
            <input
              type="text"
              className="ogp-top-input"
              value={form.gatePassNo}
              onChange={e => handleChange("gatePassNo", e.target.value)}
            />
          </div>
          <div className="ogp-top-field">
            <div className="ogp-top-label">DATE</div>
            <input
              type="date"
              className="ogp-top-input"
              value={form.dated}
              onChange={e => handleChange("dated", e.target.value)}
            />
          </div>
        </div>

        {/* PARTY / DETAILS */}
        <div className="ogp-section-header ogp-section-dark">PARTY / DETAILS</div>
        <div className="ogp-section-body">
          <div className="ogp-row">
            <div className="ogp-row-label">Customer / Party Name</div>
            <input
              type="text"
              className="ogp-row-input"
              value={form.customerName}
              onChange={e => handleChange("customerName", e.target.value)}
            />
          </div>
          <div className="ogp-row">
            <div className="ogp-row-label">Delivery Address</div>
            <input
              type="text"
              className="ogp-row-input"
              value={form.deliveryAddress}
              onChange={e => handleChange("deliveryAddress", e.target.value)}
            />
          </div>
          <div className="ogp-row">
            <div className="ogp-row-label">Vehicle No. / Transporter</div>
            <input
              type="text"
              className="ogp-row-input"
              value={form.vehicleNo}
              onChange={e => handleChange("vehicleNo", e.target.value)}
            />
          </div>
          <div className="ogp-row">
            <div className="ogp-row-label">Driver Name / Contact</div>
            <input
              type="text"
              className="ogp-row-input"
              value={form.driverName}
              onChange={e => handleChange("driverName", e.target.value)}
            />
          </div>
          <div className="ogp-row">
            <div className="ogp-row-label">Reference Invoice No.</div>
            <input
              type="text"
              className="ogp-row-input"
              value={form.referenceInvoice}
              onChange={e => handleChange("referenceInvoice", e.target.value)}
            />
          </div>
        </div>

        {/* FABRIC DETAILS */}
        <div className="ogp-section-header ogp-section-green">FABRIC DETAILS</div>
        <div className="ogp-fabric-type-row">
          <div className="ogp-fabric-type-label">Fabric Type</div>
          <label className={`ogp-radio-label ${form.fabricType === "DYED" ? "active" : ""}`}>
            <input
              type="radio"
              name="fabricType"
              value="DYED"
              checked={form.fabricType === "DYED"}
              onChange={() => handleChange("fabricType", "DYED")}
            />
            <span className="ogp-radio-custom"></span>
            <strong>DYED FABRIC</strong>
          </label>
          <label className={`ogp-radio-label ${form.fabricType === "GREY" ? "active" : ""}`}>
            <input
              type="radio"
              name="fabricType"
              value="GREY"
              checked={form.fabricType === "GREY"}
              onChange={() => handleChange("fabricType", "GREY")}
            />
            <span className="ogp-radio-custom"></span>
            <strong>GREY FABRIC</strong>
          </label>
        </div>

        {/* ITEMS TABLE */}
        <table className="ogp-items-table">
          <thead>
            <tr>
              <th className="ogp-col-no">#</th>
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
                <td className="ogp-col-no">{i + 1}</td>
                <td><input type="text" className="ogp-cell-input" value={item.description} onChange={e => handleItemChange(i, "description", e.target.value)} /></td>
                <td><input type="text" className="ogp-cell-input" value={item.color} onChange={e => handleItemChange(i, "color", e.target.value)} /></td>
                <td><input type="text" className="ogp-cell-input" value={item.design} onChange={e => handleItemChange(i, "design", e.target.value)} /></td>
                <td><input type="number" className="ogp-cell-input ogp-cell-number" value={item.rolls} onChange={e => handleItemChange(i, "rolls", e.target.value)} /></td>
                <td><input type="number" className="ogp-cell-input ogp-cell-number" value={item.weight} onChange={e => handleItemChange(i, "weight", e.target.value)} /></td>
                <td><input type="number" className="ogp-cell-input ogp-cell-number" value={item.meters} onChange={e => handleItemChange(i, "meters", e.target.value)} /></td>
                <td><input type="text" className="ogp-cell-input" value={item.remarks} onChange={e => handleItemChange(i, "remarks", e.target.value)} /></td>
              </tr>
            ))}
            <tr className="ogp-total-row">
              <td colSpan="4" className="ogp-total-label">TOTAL</td>
              <td className="ogp-total-value">{calcTotal("rolls")}</td>
              <td className="ogp-total-value">{calcTotal("weight")}</td>
              <td className="ogp-total-value">{calcTotal("meters")}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* SECURITY / GATE CHECKING */}
        <div className="ogp-section-header ogp-section-dark">SECURITY / GATE CHECKING</div>
        <div className="ogp-section-body">
          <div className="ogp-row">
            <div className="ogp-row-label">Gate Out Time</div>
            <input
              type="text"
              className="ogp-row-input"
              value={form.gateOutTime}
              onChange={e => handleChange("gateOutTime", e.target.value)}
            />
          </div>
          <div className="ogp-row">
            <div className="ogp-row-label">Security Guard Name</div>
            <input
              type="text"
              className="ogp-row-input"
              value={form.securityGuard}
              onChange={e => handleChange("securityGuard", e.target.value)}
            />
          </div>
          <div className="ogp-row">
            <div className="ogp-row-label">Checked By (Store)</div>
            <input
              type="text"
              className="ogp-row-input"
              value={form.checkedByStore}
              onChange={e => handleChange("checkedByStore", e.target.value)}
            />
          </div>
        </div>

        {/* SIGNATURES */}
        <div className="ogp-signatures">
          <div className="ogp-signature-col">
            <div className="ogp-signature-header">ISSUED BY</div>
            <div className="ogp-signature-body">
              <div className="ogp-sig-line">
                <span className="ogp-sig-label">Name:</span>
                <input type="text" className="ogp-sig-input" value={form.issuedByName} onChange={e => handleChange("issuedByName", e.target.value)} />
              </div>
              <div className="ogp-sig-line">
                <span className="ogp-sig-label">Designation:</span>
                <input type="text" className="ogp-sig-input" value={form.issuedByDesignation} onChange={e => handleChange("issuedByDesignation", e.target.value)} />
              </div>
              <div className="ogp-sig-line">
                <span className="ogp-sig-label">Date:</span>
                <input type="text" className="ogp-sig-input" value={form.issuedByDate} onChange={e => handleChange("issuedByDate", e.target.value)} />
              </div>
            </div>
          </div>
          <div className="ogp-signature-col">
            <div className="ogp-signature-header">STORE / WAREHOUSE</div>
            <div className="ogp-signature-body">
              <div className="ogp-sig-line">
                <span className="ogp-sig-label">Name:</span>
                <input type="text" className="ogp-sig-input" value={form.storeName} onChange={e => handleChange("storeName", e.target.value)} />
              </div>
              <div className="ogp-sig-line">
                <span className="ogp-sig-label">Signature:</span>
                <input type="text" className="ogp-sig-input" value={form.storeSignature} onChange={e => handleChange("storeSignature", e.target.value)} />
              </div>
              <div className="ogp-sig-line">
                <span className="ogp-sig-label">Date:</span>
                <input type="text" className="ogp-sig-input" value={form.storeDate} onChange={e => handleChange("storeDate", e.target.value)} />
              </div>
            </div>
          </div>
          <div className="ogp-signature-col">
            <div className="ogp-signature-header">AUTHORIZED SIGNATORY</div>
            <div className="ogp-signature-body">
              <div className="ogp-sig-line">
                <span className="ogp-sig-label">Name:</span>
                <input type="text" className="ogp-sig-input" value={form.authorizedName} onChange={e => handleChange("authorizedName", e.target.value)} />
              </div>
              <div className="ogp-sig-line">
                <span className="ogp-sig-label">Designation & Stamp:</span>
                <input type="text" className="ogp-sig-input" value={form.authorizedDesignation} onChange={e => handleChange("authorizedDesignation", e.target.value)} />
              </div>
              <div className="ogp-sig-line">
                <span className="ogp-sig-label">Date:</span>
                <input type="text" className="ogp-sig-input" value={form.authorizedDate} onChange={e => handleChange("authorizedDate", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER NOTE */}
        <div className="ogp-footer-note">
          This gate-pass must be presented at the exit gate. Unauthorised removal of goods strictly prohibited. | Fine Fusion Textile
        </div>

      </div>
    </div>
  );
}

export default OutwardGatePass;
