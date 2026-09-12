import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductPublicView from "./components/ProductPublicView";
import ChatDetail from "./components/ChatDetail";
import QaytaUzHome from "./components/QaytaUzHome";
import ProductFilters from "./components/ProductFilters";
import QaytaUzFavorites from "./components/QaytaUzFavorites";
import MyListings from "./components/MyListings";
import ListingDetail from "./components/ListingDetail";
import EditListing from "./components/EditListing";
import Messages from "./components/Messages";
import Profile from "./components/Profile";
import Login from "./components/Login";
import AdminApp from "./admin/AdminApp";
import AddListingImages from "./components/AddListingImages";
import AddListingTitle from "./components/AddListingTitle";
import AddListingCategory from "./components/AddListingCategory";
import AddListingPrice from "./components/AddListingPrice";
import AddListingAttributes from "./components/AddListingAttributes";
import AddListingDescription from "./components/AddListingDescription";
import AddListingLocation from "./components/AddListingLocation";
import AddListingContact from "./components/AddListingContact";
import SellerTips from "./components/SellerTips";
import SellingGuide from "./components/SellingGuide";
import SellerGuide from "./components/SellerGuide";
import MyOrders from "./components/MyOrders";
import PublicProfile from "./components/PublicProfile";
import EditProfile from "./components/EditProfile";
import Settings from "./components/Settings";
import NotificationSettings from "./components/NotificationSettings";
import SellerProfile from "./components/SellerProfile";
import SelectListingForReview from "./components/SelectListingForReview";
import WriteReview from "./components/WriteReview";



function PlaceholderPage({ title }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Manrope, sans-serif",
        color: "#5B6459",
        paddingBottom: 88,
      }}
    >
      {title} sahifasi hali tayyor emas
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QaytaUzHome />} />
        <Route path="/filtrlar" element={<ProductFilters />} />
        <Route path="/sevimlilar" element={<QaytaUzFavorites />} />
        <Route path="/sotish" element={<MyListings />} />
        <Route path="/xabarlar" element={<Messages />} />
        <Route path="/xabarlar/:chatId" element={<ChatDetail />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="/kirish" element={<Login />} />
        <Route path="/biznes" element={<PlaceholderPage title="Biznes uchun QaytaUz" />} />
        <Route path="/yordam" element={<PlaceholderPage title="Qo'llab-quvvatlash xizmati" />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/sotish/yangi" element={<AddListingImages />} />
        <Route path="/sotish/sarlavha" element={<AddListingTitle />} />
        <Route path="/sotish/kategoriya" element={<AddListingCategory />} />
        <Route path="/sotish/narx" element={<AddListingPrice />} />
        <Route path="/sotish/xususiyat" element={<AddListingAttributes />} />
        <Route path="/sotish/tavsif" element={<AddListingDescription />} />
        <Route path="/sotish/joylashuv" element={<AddListingLocation />} />
        <Route path="/sotish/kontakt" element={<AddListingContact />} />
        <Route path="/sotish/maslahatlar" element={<SellerTips />} />
        <Route path="/sotish/qollanma" element={<SellingGuide />} />
        <Route path="/sotish/qollanma/:topic" element={<SellerGuide />} />
        <Route path="/sotish/reklama" element={<PlaceholderPage title="Reklama sotib olish" />} />
        <Route path="/sotish/statistika" element={<PlaceholderPage title="E'lon statistikasi" />} />
        <Route path="/sotish/elon/:id" element={<ListingDetail />} />
        <Route path="/mahsulot/:id" element={<ProductPublicView />} />
        <Route path="/sotish/elon/:id/tahrirlash" element={<EditListing />} />
        <Route path="/buyurtmalar" element={<MyOrders />} />
        <Route path="/profil/korinish" element={<PublicProfile />} />
        <Route path="/profil/tahrirlash" element={<EditProfile />} />
        <Route path="/sozlamalari" element={<Settings />} />
        <Route path="/sozlamalari/bildirishnomalar" element={<NotificationSettings />} />
        <Route path="/sotuvchi/:id" element={<SellerProfile />} />
        <Route path="/sotuvchi/:id/baholash" element={<SelectListingForReview />} />
        <Route path="/sotuvchi/:id/baholash/:productId" element={<WriteReview />} />
      </Routes>
    </BrowserRouter>
  );
}
