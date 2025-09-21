import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../layouts/sidebar";
import { adminMenu } from "../../layouts/layoutAdmin/adminMenu";
import { FaUsers, FaBox, FaClipboardList } from 'react-icons/fa';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    usersCount: 0,
    productsCount: 0,
    ordersCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        fetch("http://localhost:3001/api/users"),
        fetch("http://localhost:3001/api/products"),
        fetch("http://localhost:3001/api/orders"),
      ]);

      const [usersData, productsData, ordersData] = await Promise.all([
        usersRes.json(),
        productsRes.json(),
        ordersRes.json(),
      ]);

      setDashboardData({
        usersCount: Array.isArray(usersData) ? usersData.length : 0,
        productsCount: Array.isArray(productsData) ? productsData.length : 0,
        ordersCount: Array.isArray(ordersData) ? ordersData.length : 0,
      });
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardShortcuts = [
    {
      title: "Pengguna Terdaftar",
      count: dashboardData.usersCount,
      link: "/admin/users",
      icon: <FaUsers className="h-8 w-8 text-elegantburgundy" />,
    },
    {
      title: "Total Produk",
      count: dashboardData.productsCount,
      link: "/admin/list-produk",
      icon: <FaBox className="h-8 w-8 text-elegantburgundy" />,
    },
    {
      title: "Total Transaksi",
      count: dashboardData.ordersCount,
      link: "/admin/riwayat",
      icon: <FaClipboardList className="h-8 w-8 text-elegantburgundy" />,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-lightmauve items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elegantburgundy"></div>
          <span className="text-xl font-semibold text-darkgray">Loading</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-lightmauve">
      <Sidebar
        menu={adminMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main
        className={`flex-1 p-6 md:p-8 lg:p-10 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        <h1 className="text-3xl font-bold text-darkgray mb-8">
          Admin Dashboard
        </h1>

        <section className="bg-purewhite shadow rounded-lg p-6 mb-10">
          <h2 className="text-2xl font-semibold text-darkgray">
            Selamat Datang, Admin!
          </h2>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardShortcuts.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="bg-purewhite rounded-lg shadow p-6 flex flex-col items-center justify-center hover:bg-lightmauve transition-colors"
            >
              <div className="mb-2">{item.icon}</div>
              <span className="text-4xl font-extrabold text-darkgray">
                {item.count}
              </span>
              <span className="mt-2 text-darkgray font-medium text-center">
                {item.title}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;