import React from "react";
import ReactDOM from "react-dom/client";
import App from "../restaurant-qr-menu.jsx";
import "./styles.scss";
import "./scss/auth.scss";
import "./scss/tablebook.scss";
import "./scss/ordertab.scss";
import "./scss/qrtab.scss";
import "./scss/menucategories.scss";
import "./scss/analyticstab.scss";
import "./scss/menumgmt.scss";
import "./scss/dashboardhome.scss";
import "./scss/ui/button.scss";
import "./scss/invoicesummary.scss";
import "./scss/homepage.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
