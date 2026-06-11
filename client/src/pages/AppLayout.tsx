import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <>
      <p>Banner</p>
      <p>Navbar</p>
      <main className="min-h-screen">
        <Outlet />
      </main>
      <p>footer</p>
      <p>cartsidebar</p>
    </>
  );
};

export default AppLayout;
