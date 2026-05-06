import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./Dashboard";
import AddParty from "./AddParty";
import Invoice from "./Invoice";
import PermenantTable from "./PermenantTable";
import Contract from "./Contract";
import ContractTable from "./ContractTable";
import ReceiptsTable from "./ReceiptsTable";
import GreighReceipt from "./GreighReceipt";
import GatePass from "./GatePass";
import InwardPage from "./InwardGatePassForm";
// import InwardPage from "./InwardPage";
import OutwardGatePass from "./OutwardGatePass";
import IssueToDyeingPage from "./IssueToDyeingPage";
import DyedReceivePage from "./DyedReceivePage";
import Inventory from "./Inventory";


function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Dashboard />} />

        <Route path="/add-party" element={<AddParty />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/permenant-table" element={<PermenantTable />} />
        <Route path="/contract" element={<Contract />} />
        <Route path="/contracts" element={<ContractTable />} />
        <Route path="/receipts" element={<ReceiptsTable />} />
        <Route path="/griegh-receipts" element={<GreighReceipt />} />
        <Route path="/gate-pass" element={<GatePass />} />
        {/* <Route path="/inward" element={<InwardForm />} /> */}

        <Route path="/inward-page" element={<InwardPage />} />
        <Route path="/outward-gatepass" element={<OutwardGatePass />} />
        <Route path="/issue-to-dyeing" element={<IssueToDyeingPage />} />
        <Route path="/dyed-receive" element={<DyedReceivePage />} />
        <Route path="/inventory" element={<Inventory />} />
      </Routes>
    </Router>
  );
}

export default App;
