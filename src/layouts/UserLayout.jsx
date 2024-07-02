import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/shop/layout/Header";
import Footer from "@/components/shop/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useStore } from "@/store";

export default function UserLayout() {
  const navigate = useNavigate();
  const authToken = useStore((state) => state.authToken);
  const location = useLocation();

  async function fetchUser() {
    if (!authToken) {
      navigate(`/auth/login?redirectTo=${location.pathname}`);
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/users/user`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    if (!response.ok) {
      navigate(`/auth/login?redirectTo=${location.pathname}`);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <>
      <Header />
      <Outlet />
      <Toaster position="bottom-center" />
      <Footer />
    </>
  );
}
