import {
  FaHome,
  FaTachometerAlt,
  FaUserCircle,
  FaListAlt,
} from "react-icons/fa";

export const userMenu = [
  {
    label: "Beranda",
    to: "/",
    icon: <FaHome className="h-6 w-6" />,
  },
  {
    label: "Dashboard",
    to: "/user/dashboard",
    icon: <FaTachometerAlt className="h-6 w-6" />,
  },
  {
    label: "Profil",
    to: "/user/profile",
    icon: <FaUserCircle className="h-6 w-6" />,
  },
  {
    label: "Pesanan Saya",
    to: "/user/orders",
    icon: <FaListAlt className="h-6 w-6" />,
  },
];
