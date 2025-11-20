import {
  FaHome,
  FaTachometerAlt,
  FaUsers,
  FaBox,
  FaClipboardList,
} from "react-icons/fa";

export const adminMenu = [
  {
    label: "Beranda",
    to: "/",
    icon: <FaHome className="h-6 w-6" />,
  },
  {
    label: "Dashboard",
    to: "/admin/dashboard",
    icon: <FaTachometerAlt className="h-6 w-6" />,
  },
  {
    label: "Users",
    to: "/admin/users",
    icon: <FaUsers className="h-6 w-6" />,
  },
  {
    label: "Produk",
    to: "/admin/list-produk",
    icon: <FaBox className="h-6 w-6" />,
    children: [
      { label: "Tambah Produk", to: "/admin/tambah-produk" },
      { label: "List Produk", to: "/admin/list-produk" },
      { label: "List Kategori", to: "/admin/list-kategori" },
    ],
  },
  {
    label: "Riwayat",
    to: "/admin/riwayat",
    icon: <FaClipboardList className="h-6 w-6" />,
  },
];
