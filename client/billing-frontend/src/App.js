import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./Dashboard";
import AddParty from "./AddParty";
import AddContract from "./AddContract";
import Invoice from "./Invoice";
import PermenantTable from "./PermenantTable";
import Contract from "./Contract";
import ContractTable from "./ContractTable";
import ReceiptsTable from "./ReceiptsTable";
import GreighReceipt from "./GreighReceipt";
import GatePass from "./GatePass";
import InwardEntry from "./InwardEntry";
import InwardPreview from "./InwardPreview";
import OutwardEntry from "./OutwardEntry";
import OutwardPreview from "./OutwardPreview";
import IssueToDyeingPage from "./IssueToDyeingPage";
import DyedReceivePage from "./DyedReceivePage";
import Inventory from "./Inventory";
import Logs from "./Logs";
import DocumentPreview from "./DocumentPreview";
import Orders from "./Orders";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Dashboard />} />

        <Route path="/add-party" element={<AddParty />} />
        <Route path="/add-contract" element={<AddContract />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/permenant-table" element={<PermenantTable />} />
        <Route path="/contract" element={<Contract />} />

        {/* Renamed: /contracts → /contract-table. Old URL kept as a redirect. */}
        <Route path="/contract-table" element={<ContractTable />} />
        <Route path="/contracts" element={<Navigate to="/contract-table" replace />} />

        <Route path="/receipts" element={<ReceiptsTable />} />
        <Route path="/griegh-receipts" element={<GreighReceipt />} />
        <Route path="/gate-pass" element={<GatePass />} />

        {/* New two-step Inward & Outward flow */}
        <Route path="/inward-entry" element={<InwardEntry />} />
        <Route path="/inward-preview" element={<InwardPreview />} />
        <Route path="/outward-entry" element={<OutwardEntry />} />
        <Route path="/outward-preview" element={<OutwardPreview />} />

        {/* Legacy routes redirect to the new entry forms */}
        <Route path="/inward-page" element={<Navigate to="/inward-entry" replace />} />
        <Route path="/outward-gatepass" element={<Navigate to="/outward-entry" replace />} />

        <Route path="/issue-to-dyeing" element={<IssueToDyeingPage />} />
        <Route path="/dyed-receive" element={<DyedReceivePage />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/orders" element={<Orders />} />

        {/* Logs + per-document re-render preview */}
        <Route path="/logs" element={<Logs />} />
        <Route path="/preview/:type/:auditId" element={<DocumentPreview />} />
      </Routes>
    </Router>
  );
}

export default App;
