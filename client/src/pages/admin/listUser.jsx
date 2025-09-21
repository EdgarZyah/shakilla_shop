import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import { adminMenu } from "../../layouts/layoutAdmin/adminMenu";
import Cookies from "js-cookie";
import Table from "../../components/table";
import ModalHapus from "../../components/modalHapus";
import Pagination from "../../components/pagination";

const ListUser = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [editStatus, setEditStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const currentUserId = parseInt(Cookies.get('userId'), 10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3001/api/users");
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
        console.error("Data users bukan array:", data);
      }
    } catch (error) {
      console.error("Error fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsModalOpen(false);
    if (!userToDelete) return;

    setLoading(true);
    setDeleteStatus(null);
    try {
      const res = await fetch(`http://localhost:3001/api/users/${userToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers(users.filter(user => user.id !== userToDelete.id));
        setDeleteStatus({ type: "success", message: "Pengguna berhasil dihapus." });
      } else {
        const data = await res.json();
        setDeleteStatus({ type: "error", message: data.message || "Gagal menghapus pengguna." });
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setDeleteStatus({ type: "error", message: "Terjadi kesalahan jaringan." });
    } finally {
      setLoading(false);
      setUserToDelete(null);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setNewRole(user.role);
    setNewPassword("");
    setEditStatus(null);
    setShowEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setEditStatus(null);
    if (!editingUser) return;

    try {
      let roleUpdated = false;
      let passwordUpdated = false;

      if (newRole && newRole !== editingUser.role) {
        const roleRes = await fetch(`http://localhost:3001/api/users/${editingUser.id}/role`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role: newRole }),
        });
        const roleData = await roleRes.json();
        if (!roleRes.ok) throw new Error(roleData.message || "Gagal memperbarui role.");
        roleUpdated = true;
      }

      if (newPassword && newPassword.length >= 8) {
        const passwordRes = await fetch(`http://localhost:3001/api/users/${editingUser.id}/password`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ newPassword }),
        });
        const passwordData = await passwordRes.json();
        if (!passwordRes.ok) throw new Error(passwordData.message || "Gagal memperbarui password.");
        passwordUpdated = true;
      }
      
      const message = [];
      if (roleUpdated) message.push("Role berhasil diperbarui.");
      if (passwordUpdated) message.push("Password berhasil diperbarui.");

      if (message.length > 0) {
        setEditStatus({ type: "success", message: message.join(" ") });
        await fetchUsers();
        setShowEditModal(false);
      } else {
        setEditStatus({ type: "success", message: "Tidak ada perubahan yang disimpan." });
      }

    } catch (err) {
      setEditStatus({ type: "error", message: err.message || "Gagal memperbarui data pengguna." });
    }
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);
  };

  const filteredAndSortedUsers = users
    .filter((user) => {
      const matchesSearch = 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const aValue = getNestedValue(a, sortBy);
      const bValue = getNestedValue(b, sortBy);
      if (typeof aValue === "string" && typeof bValue === "string") {
        const result = aValue.localeCompare(bValue);
        return sortOrder === "asc" ? result : -result;
      }
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const uniqueRoles = [...new Set(users.map(user => user.role).filter(Boolean))];

  // Logika Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentUsers = filteredAndSortedUsers.slice(firstItemIndex, lastItemIndex);

  const userTableColumns = [
    { key: 'id', label: 'ID', sortable: true, render: (user) => `#${user.id}` },
    { key: 'username', label: 'Username', sortable: true, render: (user) => user.username || '-' },
    { key: 'email', label: 'Email', sortable: true, render: (user) => user.email || '-' },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (user) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            user.role === "admin"
              ? "bg-softpink/50 text-elegantburgundy"
              : user.role === "user"
              ? "bg-lightmauve text-darkgray"
              : "bg-lightmauve text-darkgray"
          }`}
        >
          {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Unknown"}
        </span>
      ),
    },
  ];

  const renderActions = (user) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleEdit(user)}
        className="text-elegantburgundy hover:text-softpink transition-colors"
      >
        Edit
      </button>
      <button
        onClick={() => handleDeleteClick(user)}
        className="text-softpink hover:text-elegantburgundy transition-colors"
        disabled={user.id === currentUserId}
        title={user.id === currentUserId ? "Tidak dapat menghapus diri sendiri" : "Hapus Pengguna"}
      >
        Hapus
      </button>
    </div>
  );

  return (
    <div className="py-16 md:py-0 w-screen min-h-screen bg-lightmauve">
      <Sidebar
        menu={adminMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main
        className={`flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        {/* Header dan Filter */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-darkgray mb-2">
            Daftar Pengguna
          </h1>
          <p className="text-darkgray/70">
            Kelola semua pengguna yang terdaftar di sistem
          </p>
        </div>
        
        {deleteStatus && (
          <div className={`p-4 mb-4 text-sm rounded-lg ${deleteStatus.type === "success" ? "bg-softpink/50 text-darkgray" : "bg-softpink/50 text-elegantburgundy"}`} role="alert">
            {deleteStatus.message}
          </div>
        )}

        <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-darkgray mb-2">
                Cari Pengguna
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  placeholder="Cari berdasarkan username atau email..."
                  value={searchTerm}
                  onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                  className="w-full pl-10 pr-4 py-2 border border-lightmauve rounded-lg focus:ring-2 focus:ring-elegantburgundy focus:border-elegantburgundy transition-colors"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-darkgray/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="sm:w-48">
              <label htmlFor="roleFilter" className="block text-sm font-medium text-darkgray mb-2">
                Filter Role
              </label>
              <select
                id="roleFilter"
                value={roleFilter}
                onChange={(e) => {setRoleFilter(e.target.value); setCurrentPage(1);}}
                className="w-full px-3 py-2 border border-lightmauve rounded-lg focus:ring-2 focus:ring-elegantburgundy focus:border-elegantburgundy transition-colors"
              >
                <option value="all">Semua Role</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-darkgray/70">
            Menampilkan {currentUsers.length} dari {filteredAndSortedUsers.length} pengguna
          </div>
        </div>

        {/* Menggunakan Komponen Tabel */}
        <div className="bg-purewhite rounded-lg shadow-sm border border-lightmauve overflow-hidden">
          <Table
            columns={userTableColumns}
            data={currentUsers}
            loading={loading}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
            renderActions={renderActions}
          />
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      {/* Modal Edit Pengguna */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-purewhite p-8 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4 text-darkgray">Edit Pengguna: {editingUser.username}</h3>
            {editStatus && (
              <div className={`p-4 mb-4 text-sm rounded-lg ${editStatus.type === "success" ? "bg-softpink/50 text-darkgray" : "bg-softpink/50 text-elegantburgundy"}`}>
                {editStatus.message}
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-darkgray">Ganti Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              {editingUser.id === currentUserId && (
                <div>
                  <label className="block text-sm font-medium text-darkgray">Ganti Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full border border-lightmauve rounded-md shadow-sm p-2"
                    placeholder="Masukkan password baru (min. 8 karakter)"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="py-2 px-4 border border-lightmauve rounded-md shadow-sm text-sm font-medium text-darkgray hover:bg-lightmauve transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-purewhite bg-elegantburgundy hover:bg-softpink"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ModalHapus
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus pengguna "${userToDelete?.username}"? Aksi ini tidak dapat dibatalkan.`}
      />
    </div >
  );
};

export default ListUser;