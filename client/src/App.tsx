import { Routes, Route } from "react-router-dom";
import { RouteViewportReset } from "./components/shared/RouteViewportReset";
import { Navbar } from "./components/shared/Navbar";
import { BottomNav } from "./components/shared/BottomNav";
import { AdminLayout } from "./components/admin/AdminLayout";
import { PWAInstallBanner } from "./components/shared/PWAInstallBanner";
import { CityProvider } from "./context/CityContext";
import { CategoriesProvider } from "./context/CategoriesContext";
import MainScreen from "./pages/public/MainScreen";
import SearchPage from "./pages/public/SearchPage";
import SavedPage from "./pages/public/SavedPage";
import AccountPage from "./pages/public/AccountPage";
import ContactDetailPage from "./pages/public/ContactDetailPage";
import SubmitPage from "./pages/public/SubmitPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage";
import ResetPasswordPage from "./pages/public/ResetPasswordPage";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminContacts from "./pages/admin/Contacts";
import AdminAddContact from "./pages/admin/AddContact";
import AdminReviews from "./pages/admin/Reviews";
import AdminUsers from "./pages/admin/Users";
import BusinessShowcasePage from "./pages/public/BusinessShowcasePage";
import ProductDetailPage from "./pages/public/ProductDetailPage";
import { InquiryProvider } from "./features/storefront/InquiryContext";
import ProDashboardPage from "./pages/pro/ProDashboardPage";
import CatalogPlansPage from "./pages/public/CatalogPlansPage";
import ContactConciergePage from "./pages/public/ContactConciergePage";
import AdminHeroPromotions from "./pages/admin/HeroPromotions";
import ModularCatalogPage from "./pages/public/ModularCatalogPage";

export default function App() {
  return (
    <CityProvider>
      <CategoriesProvider>
        <InquiryProvider>
        <RouteViewportReset />
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
                    <Route path="/catalog" element={<BusinessShowcasePage />} />
                    <Route path="/catalog/:itemSlug" element={<ProductDetailPage />} />
                    <Route path="/katalog" element={<ModularCatalogPage />} />
                    <Route path="/katalog/:exampleType" element={<ModularCatalogPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/saved" element={<SavedPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/pro" element={<ProDashboardPage />} />
                    <Route path="/buat-katalog" element={<CatalogPlansPage />} />
                    <Route path="/jastip-kontak" element={<ContactConciergePage />} />
                    <Route path="/kontak/:id" element={<ContactDetailPage />} />
                    <Route path="/submit" element={<SubmitPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
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
            <Route path="hero-promotions" element={<AdminHeroPromotions />} />
          </Route>
        </Routes>
        </div>
        </InquiryProvider>
      </CategoriesProvider>
    </CityProvider>
  );
}
