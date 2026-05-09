import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { API_URL } from "./config";
import InwardGatePassDocument from "./InwardGatePassDocument";
import OutwardGatePassDocument from "./OutwardGatePassDocument";

/**
 * Re-renders a saved document from an audit-log snapshot.
 * Route: /preview/:type/:auditId
 *
 * The "snapshot" stored in the audit row is the full entity state at change time.
 * For Inward / Outward we adapt the entity-shaped JSON back to the document
 * component's expected `form` + `items` shape.
 */
function DocumentPreview() {
  const { type, auditId } = useParams();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/audit/${auditId}`)
      .then(res => {
        if (!res.ok) throw new Error("Could not load audit row");
        return res.json();
      })
      .then(audit => {
        if (!audit.snapshot) {
          throw new Error("No snapshot stored for this entry");
        }
        setSnapshot(JSON.parse(audit.snapshot));
      })
      .catch(err => setError(err.message));
  }, [auditId]);

  if (error) {
    return (
      <div className="loading-container">
        <h2>Couldn't load preview</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/logs")}>← Back to Logs</button>
      </div>
    );
  }
  if (!snapshot) {
    return <div className="loading-container"><h2>Loading…</h2></div>;
  }

  const handlePrint = () => window.print();

  if (type === "InwardGatePass") {
    const { form, items } = adaptInward(snapshot);
    return (
      <PreviewShell
        type="inward" navigate={navigate}
        gatePassNo={form.gatePassNo} onPrint={handlePrint}>
        <InwardGatePassDocument form={form} items={items} readOnly={true} />
      </PreviewShell>
    );
  }
  if (type === "OutwardGatePass") {
    const { form, items } = adaptOutward(snapshot);
    return (
      <PreviewShell
        type="outward" navigate={navigate}
        gatePassNo={form.gatePassNo} onPrint={handlePrint}>
        <OutwardGatePassDocument form={form} items={items} readOnly={true} />
      </PreviewShell>
    );
  }

  // Fallback: raw JSON view for Contract / DyedReceive (proper templates can be added later).
  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => navigate("/logs")} style={btn}>← Back to Logs</button>
      <h2 style={{ marginTop: 16 }}>{type} Snapshot</h2>
      <p style={{ color: "#666" }}>
        A printable template for this document type isn't built yet — showing raw record:
      </p>
      <pre style={{ background: "#f5f5f5", padding: 16, borderRadius: 6,
                    overflowX: "auto", fontSize: 12 }}>
        {JSON.stringify(snapshot, null, 2)}
      </pre>
    </div>
  );
}

function PreviewShell({ type, navigate, gatePassNo, onPrint, children }) {
  const wrapperClass = type === "inward" ? "igp-wrapper" : "ogp-wrapper";
  const actionsClass = type === "inward" ? "igp-actions" : "ogp-actions";
  const btnPrint = type === "inward" ? "igp-btn igp-btn-print" : "ogp-btn ogp-btn-print";
  const btnPdf = type === "inward" ? "igp-btn igp-btn-pdf" : "ogp-btn ogp-btn-pdf";
  const docId = type === "inward" ? "inward-gatepass-doc" : "outward-gatepass-doc";

  const handlePDF = () => {
    const node = document.getElementById(docId);
    if (!node) return;
    html2canvas(node, { scale: 3, backgroundColor: "#ffffff" }).then((canvas) => {
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 200;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 5, 5, imgWidth, imgHeight);
      pdf.save(`${type}_${gatePassNo || "snapshot"}.pdf`);
    });
  };

  return (
    <div className={wrapperClass}>
      <div className={actionsClass}>
        <button className={btnPrint} onClick={() => navigate("/logs")}>← Logs</button>
        <button className={btnPrint} onClick={onPrint}>🖨️ Print</button>
        <button className={btnPdf} onClick={handlePDF}>📄 Download PDF</button>
      </div>
      {children}
    </div>
  );
}

/** Convert a stored InwardGatePass row back to the form/items shape the document expects. */
function adaptInward(snap) {
  const form = {
    gatePassNo: snap.inwardId || "",
    dated: snap.dated || "",
    supplierName: snap.supplierName || snap.nameOfParty || "",
    receivedFrom: snap.address || "",
    vehicleNo: snap.vehicleNo || "",
    driverName: snap.driverName || "",
    referenceChallan: snap.referenceNo || snap.contractNo || "",
    fabricType: (snap.isDyedFabric || snap.fabricType === "DYED") ? "DYED" : "GREY",
    gateInTime: snap.gateTime || "",
    securityGuard: snap.securityGuardName || "",
    receivedCheckedBy: snap.checkedBy || "",
    receivedByName: "",
    receivedByDesignation: "",
    receivedByDate: "",
    storeName: "", storeSignature: "", storeDate: "",
    authorizedName: "", authorizedDesignation: "", authorizedDate: ""
  };
  const items = (snap.items || []).map(it => ({
    description: it.quality || "",
    color: it.color || "",
    design: it.design || "",
    rolls: it.roll != null ? String(it.roll) : "",
    weight: it.kg != null ? String(it.kg) : "",
    meters: it.meters != null ? String(it.meters) : "",
    remarks: it.remarks || ""
  }));
  return { form, items };
}

function adaptOutward(snap) {
  const form = {
    gatePassNo: snap.outwardId || "",
    dated: snap.dated || "",
    type: snap.type === "RETURN" ? "RETURN" : "DELIVERY",
    fabricType: snap.fabricType === "DYED" ? "DYED" : "GREY",
    customerName: snap.customerName || "",
    deliveryAddress: snap.address || "",
    vehicleNo: snap.vehicleNo || "",
    driverName: snap.driverName || "",
    referenceInvoice: snap.referenceNo || snap.contractNo || "",
    gateOutTime: snap.gateTime || "",
    securityGuard: snap.securityGuardName || "",
    checkedByStore: snap.checkedBy || "",
    issuedByName: "", issuedByDesignation: "", issuedByDate: "",
    storeName: "", storeSignature: "", storeDate: "",
    authorizedName: "", authorizedDesignation: "", authorizedDate: ""
  };
  const items = (snap.items || []).map(it => ({
    description: it.quality || "",
    color: it.color || "",
    design: it.design || "",
    rolls: it.roll != null ? String(it.roll) : "",
    weight: it.kg != null ? String(it.kg) : "",
    meters: it.meters != null ? String(it.meters) : "",
    remarks: it.remarks || ""
  }));
  return { form, items };
}

const btn = { padding: "8px 14px", backgroundColor: "#667eea", color: "white",
              border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600 };

export default DocumentPreview;
