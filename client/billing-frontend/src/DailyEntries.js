import React, { useEffect, useState } from "react";

function DailyEntries() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/entries")
      .then(res => res.json())
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...entries];

    updated[index][field] = value;

    // 🔥 AUTO CALCULATIONS
    const qty = parseFloat(updated[index].quantityKgBilled) || 0;
    const rate = parseFloat(updated[index].rate) || 0;

    const amount = qty * rate;
const gst = updated[index].gstInvoiceYesNo === "Yes"
  ? amount * 0.18
  : 0;
    const total = amount + gst;

    updated[index].amount = amount;
    updated[index].gstAmount = gst;
    updated[index].totalAmount = total;

    setEntries(updated);
  };

  const addRow = () => {
    setEntries([
      ...entries,
      {
        dated: "",
        partyCode: "",
        nameOfParty: "",
        gstInvoiceYesNo: "",
        commercialBillNo: "",
        gstInvoiceNo: "",
        description: "",
        quality: "",
        colour: "",
        greyInRoll: 0,
        greyInKg: 0,
        dyedFabricARoll: 0,
        dyedFabricOutAKg: 0,
        dyedFabricBRoll: 0,
        dyedFabricOutBKg: 0,
        dyedFabricOutCP: 0,
        quantityRollBilled: 0,
        quantityKgBilled: 0,
        rate: 0,
        amount: 0,
        gstAmount: 0,
        totalAmount: 0
      }
    ]);
  };

  return (
    <div className="daily-entries-page">
      
      {/* HEADER */}
      <div className="entries-header">
        <div className="header-content">
          <h1>Daily Entries</h1>
          <p>Manage and track all daily transaction entries</p>
        </div>
        <button onClick={addRow} className="btn-add-row">
          <span>+</span> Add New Row
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="entries-table">

            <thead>
              <tr>
                <th>S.No.</th>
                <th>Dated</th>
                <th>Party_Code</th>
                <th>Name_of_Party</th>
                <th>GST</th>
                <th>Commercial_Bill_No.</th>
                <th>GST_Invoice_No.</th>
                <th>Description</th>
                <th>Quality</th>
                <th>Colour</th>
                <th>Grey_In_Roll</th>
                <th>Grey_In_KG</th>
                <th>Dyed_Fabric_A_Roll</th>
                <th>Dyed_Fabric_Out_A_KG</th>
                <th>Dyed_Fabric_Out_B_Roll</th>
                <th>Dyed_Fabric_Out_BKg</th>
                <th>Dyed_Fabric_Out_CP</th>
                <th>Qty_Roll_Billed</th>
                <th>Qty_Kg_Billed</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>GST_Amount</th>
                <th>Total</th>
              </tr>
            </thead>

          <tbody>
            {entries.map((row, i) => (
              <tr key={i}>

                <td>{i + 1}</td>

                <td>
                  <input type="date"
                    value={row.dated || ""}
                    onChange={e => handleChange(i, "dated", e.target.value)}
                  />
                </td>

                <td>
                  <input
                    value={row.partyCode || ""}
                    onChange={e => handleChange(i, "partyCode", e.target.value)}
                  />
                </td>

                <td>
                  <input
                    value={row.nameOfParty || ""}
                    onChange={e => handleChange(i, "nameOfParty", e.target.value)}
                  />
                </td>

                <td>
                  <input type="checkbox"
                    checked={row.gstInvoice || false}
                    onChange={e => handleChange(i, "gstInvoice", e.target.checked)}
                  />
                </td>

                <td><input onChange={e => handleChange(i, "commercialBillNo", e.target.value)} /></td>
                <td>
                  <select
                    value={row.gstInvoiceYesNo || ""}
                    onChange={e => handleChange(i, "gstInvoiceYesNo", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </td>
                <td><input onChange={e => handleChange(i, "description", e.target.value)} /></td>
                <td><input onChange={e => handleChange(i, "quality", e.target.value)} /></td>
                <td><input onChange={e => handleChange(i, "colour", e.target.value)} /></td>

                <td><input type="number" onChange={e => handleChange(i, "greyInRoll", e.target.value)} /></td>
                <td><input type="number" onChange={e => handleChange(i, "greyInKg", e.target.value)} /></td>

                <td><input type="number" onChange={e => handleChange(i, "dyedFabricARoll", e.target.value)} /></td>
                <td><input type="number" onChange={e => handleChange(i, "dyedFabricOutAKg", e.target.value)} /></td>

                <td><input type="number" onChange={e => handleChange(i, "dyedFabricBRoll", e.target.value)} /></td>
                <td><input type="number" onChange={e => handleChange(i, "dyedFabricOutBKg", e.target.value)} /></td>
                <td><input type="number" onChange={e => handleChange(i, "dyedFabricOutCP", e.target.value)} /></td>

                <td><input type="number" onChange={e => handleChange(i, "quantityRollBilled", e.target.value)} /></td>
                <td><input type="number" onChange={e => handleChange(i, "quantityKgBilled", e.target.value)} /></td>

                <td><input type="number" onChange={e => handleChange(i, "rate", e.target.value)} /></td>

                <td>{row.amount?.toFixed(2)}</td>
                <td>{row.gstAmount?.toFixed(2)}</td>
                <td>{row.totalAmount?.toFixed(2)}</td>

              </tr>
            ))}
          </tbody>

        </table>
        </div>
      </div>
    </div>
  );
}


export default DailyEntries;