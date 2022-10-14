import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminRouter from "./pages/Admin/AdminRouter";
import AuthRouter from "./pages/Auth/AuthRouter";
import { Home } from "./pages/Public";
import PublicRouter from "./pages/Public/PublicRouter";
import AdminAuthGuard from "./_helpers/AdminAuthGuard";
import PublicAuthGuard from "./_helpers/PublicAuthGuard";
import Error from "./_utils/Error";

const App = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route
            path="/home/*"
            element={
              <PublicAuthGuard>
                <PublicRouter />
              </PublicAuthGuard>
            }
          />

          <Route
            path="/*"
            element={
              <PublicAuthGuard>
                <PublicRouter />
              </PublicAuthGuard>
            }
          />

          <Route
            path="/admin/*"
            element={
              <AdminAuthGuard>
                <AdminRouter />
              </AdminAuthGuard>
            }
          />
          <Route path="/auth/*" element={<AuthRouter />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
