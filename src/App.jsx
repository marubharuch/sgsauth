// src/App.js

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import SignIn from "./pages/SignIn";
import PresidentDashboard from "./pages/PresidentDashboard";
import CommitteeMemberDashboard from "./pages/CommitteeMemberDashboard";
import MemberDashboard from "./pages/MemberDashboard";
import VisitorDashboard from "./pages/VisitorDashboard";
import Profile from "./pages/Profile";
import RoleApprovalDashboard from "./pages/RoleApprovalDashboard";
import RoleManagement from "./components/RoleManagement";
import DataEntryPage from "./pages/DataEntryPage"; // Import DataEntryPage
import MigrateData from "./components/MigrateData";
import FamilyForm from "./components/FamilyForm";
import FamiliesTable from "./components/FamiliesTable";
import LocalStorageViewer from "./pages/LocalStorageViewer";
import AllRoutes from "./pages/AllRoutes"
const App = () => {
  return (
    <Router>
      <AuthProvider> {/* Wrap everything inside AuthProvider */}
        <Navbar />
        <Routes>
        <Route path="/all" element={<AllRoutes />} />
          <Route path="/" element={<VisitorDashboard />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/president" element={<PresidentDashboard />} />
          <Route path="/committee-member" element={<CommitteeMemberDashboard />} />
          <Route path="/member" element={<MemberDashboard />} />
          <Route path="/visitor-dashboard" element={<VisitorDashboard />} />
          <Route path="/role-approval" element={<RoleApprovalDashboard />} />
          <Route path="/role-management" element={<RoleManagement />} />
          <Route path="/data-entry" element={<DataEntryPage />} /> {/* Data Entry Page Route */}
          <Route path="migrate" element={<MigrateData/>}/>
          <Route path="/family" element={<FamilyForm />} />
          <Route path="/local"  element={<LocalStorageViewer/>}/>
          <Route path="/families" element={<FamiliesTable/>}/>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
