import { Link, useLocation } from "react-router-dom";
import { useI18n } from "../contexts/i18n/I18nContext";
import LanguageSelector from "./LanguageSelector";

export default function Sidebar() {
  const location = useLocation();
  const { t } = useI18n();

  const navItems = [
    { path: "/", labelKey: "sidebar.complianceCheck" },
    { path: "/create-vgc-list", labelKey: "sidebar.createVGCList" },
  ];

  return (
    <div className="w-[300px] bg-white border-r-2 border-[#23BD92]/30 h-screen p-4 flex flex-col sticky top-0">
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? "bg-[#23BD92] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="mb-4">
        <LanguageSelector />
      </div>
    </div>
  );
}
