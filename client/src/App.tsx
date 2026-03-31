import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/shared/Navbar";
import { BottomNav } from "./components/shared/BottomNav";
import { AdminLayout } from "./components/admin/AdminLayout";
import { PWAInstallBanner } from "./components/shared/PWAInstallBanner";
import { CityProvider } from "./context/CityContext";
import MainScreen from "./pages/public/MainScreen";
import SearchPage from "./pages/public/SearchPage";
import SavedPage from "./pages/public/SavedPage";
import AccountPage from "./pages/public/AccountPage";
import ContactDetailPage from "./pages/public/ContactDetailPage";
import SubmitPage from "./pages/public/SubmitPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminContacts from "./pages/admin/Contacts";
import AdminAddContact from "./pages/admin/AddContact";
import AdminReviews from "./pages/admin/Reviews";
import AdminUsers from "./pages/admin/Users";

export default function App() {
  return (
    <CityProvider>
      <div className="min-h-screen bg-white">
        <Routes>
          {/* Public routes */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<MainScreen />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/saved" element={<SavedPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/kontak/:id" element={<ContactDetailPage />} />
                    <Route path="/submit" element={<SubmitPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                  </Routes>
                </main>
                <PWAInstallBanner />
                <BottomNav />
              </>
            }
          />

          {/* Admin routes — own layout, no bottom nav */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="add-contact" element={<AdminAddContact />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </div>
    </CityProvider>
  );
}
