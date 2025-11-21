// client/src/pages/admin/dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
// Pastikan path import ini sesuai dengan struktur folder Anda
import Sidebar from "../../layouts/sidebar"; 
import { adminMenu } from "../../layouts/layoutAdmin/adminMenu";
import axiosClient from "../../api/axiosClient";

// --- IMPORT CHART.JS ---
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler 
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrasi komponen Chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
// -----------------------

// Komponen Ikon SVG Pengganti react-icons/fa
const UsersIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);

const BoxIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25-9 5.25m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);

const ClipboardIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
  </svg>
);


const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    usersCount: 0,
    productsCount: 0,
    ordersCount: 0,
  });
  
  // State untuk data chart
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  // State untuk filter hari (Default 7 hari)
  const [chartDays, setChartDays] = useState(7);

  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("accessToken");

  // Fungsi fetch data yang diperbarui
  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. Ambil Data Dashboard Umum
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        axiosClient.get("/users"),
        axiosClient.get("/products"),
        axiosClient.get("/orders"),
      ]);

      const usersArray = usersRes.data.users || [];
      const productsArray = productsRes.data.products || [];
      const ordersArray = Array.isArray(ordersRes.data) ? ordersRes.data : [];

      setDashboardData({
        usersCount: usersArray.length,
        productsCount: productsArray.length,
        ordersCount: ordersArray.length,
      });

      // 2. Ambil Data Chart dengan Parameter Hari
      await fetchChartData(chartDays);

    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [chartDays]); // Dependensi chartDays dihapus dari sini agar tidak infinite loop

  // Fungsi khusus fetch chart agar bisa dipanggil saat dropdown berubah
  const fetchChartData = async (days) => {
    try {
      const statsRes = await axiosClient.get("/users/dashboard/stats", {
        params: { days: days } // Kirim parameter days
      });

      setChartData({
        labels: statsRes.data.labels,
        datasets: [
          {
            label: 'Pengunjung Web',
            data: statsRes.data.data,
            borderColor: '#4A0000',
            backgroundColor: 'rgba(242, 200, 200, 0.5)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#4A0000',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#4A0000',
          },
        ],
      });
    } catch (error) {
      console.error("Gagal mengambil data chart:", error);
    }
  };

  // Effect utama untuk load awal
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [token]); 

  // Effect khusus ketika filter hari berubah
  useEffect(() => {
    if (token) {
        fetchChartData(chartDays);
    }
  }, [chartDays, token]);


  const dashboardShortcuts = [
    {
      title: "Pengguna Terdaftar",
      count: dashboardData.usersCount,
      link: "/admin/users",
      icon: <UsersIcon className="h-8 w-8 text-elegantburgundy" />,
    },
    {
      title: "Total Produk",
      count: dashboardData.productsCount,
      link: "/admin/list-produk",
      icon: <BoxIcon className="h-8 w-8 text-elegantburgundy" />,
    },
    {
      title: "Total Transaksi",
      count: dashboardData.ordersCount,
      link: "/admin/riwayat",
      icon: <ClipboardIcon className="h-8 w-8 text-elegantburgundy" />,
    },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Penting agar chart mengikuti container, bukan aspek rasio bawaan
    plugins: {
      legend: {
        position: 'top',
        labels: {
            font: { family: 'Arial' },
            color: '#333'
        }
      },
      title: {
        display: false,
        text: 'Statistik Pengunjung Harian',
      },
      tooltip: {
        intersect: false,
        mode: 'index',
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: { color: '#f3f3f3' },
            ticks: { 
                color: '#666',
                stepSize: 1, 
                precision: 0 
            }
        },
        x: {
            grid: { display: false },
            ticks: { color: '#666' }
        }
    }
  };

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
    <div className="flex min-w-screen min-h-screen bg-lightmauve">
      <Sidebar
        menu={adminMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main
        className={`py-12 md:py-0 max-w-5/6 mx-auto flex-1 p-6 md:p-8 lg:p-10 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        <h1 className="text-3xl font-bold text-darkgray mb-8">
          Admin Dashboard
        </h1>

        <section className="bg-purewhite shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-darkgray">
            Selamat Datang, Admin!
          </h2>
          <p className="text-gray-500 mt-2">Berikut adalah ringkasan aktivitas toko Anda hari ini.</p>
        </section>

        {/* --- GRID KARTU STATISTIK --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {dashboardShortcuts.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="bg-purewhite rounded-lg shadow p-6 flex flex-col items-center justify-center hover:bg-softpink/20 transition-colors border border-transparent hover:border-softpink"
            >
              <div className="mb-2 p-3 bg-lightmauve rounded-full">{item.icon}</div>
              <span className="text-4xl font-extrabold text-darkgray">
                {item.count}
              </span>
              <span className="mt-2 text-darkgray font-medium text-center">
                {item.title}
              </span>
            </Link>
          ))}
        </div>

        {/* --- SECTION CHART PENGUNJUNG --- */}
        <section className="bg-purewhite shadow rounded-lg p-6 border border-lightmauve">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-darkgray">Laporan Pengunjung Web Harian</h3>
                
                {/* Dropdown Filter Hari */}
                <select 
                    value={chartDays}
                    onChange={(e) => setChartDays(parseInt(e.target.value))}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-elegantburgundy cursor-pointer"
                >
                    <option value="7">7 Hari Terakhir</option>
                    <option value="30">30 Hari Terakhir</option>
                </select>
            </div>
            
            {/* Container Chart yang Dikontrol */}
            <div className="relative w-80vw h-[300px] sm:h-[400px]"> 
                <Line options={chartOptions} data={chartData} />
            </div>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;