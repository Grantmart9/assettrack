"use client";

import { useState, useEffect } from "react";
import userService, {
  User,
  UserInsert,
  UserUpdate,
} from "@/lib/services/userService";
import { useAuth } from "@/lib/supabase/context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type NewUser = {
  email: string;
  name: string;
  role: string;
  pages: string[];
};

// Available pages in the application
const AVAILABLE_PAGES = [
  { value: "dashboard", label: "Dashboard" },
  { value: "assets", label: "Assets" },
  { value: "scan", label: "Scan" },
  { value: "inspections", label: "Inspections" },
  { value: "reports", label: "Reports" },
  { value: "admin", label: "Admin Panel" },
  { value: "admin/users", label: "Admin - Users" },
  { value: "admin/settings", label: "Admin - Settings" },
  { value: "admin/features", label: "Admin - Features" },
  { value: "admin/logs", label: "Admin - Logs" },
  { value: "admin/billing", label: "Admin - Billing" },
  { value: "admin/companies", label: "Admin - Companies" },
];

export default function AdminUsersPage() {
  const { user } = useAuth();

  // Users list state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);

  // Form state
  const [newUser, setNewUser] = useState<NewUser>({
    email: "",
    name: "",
    role: "User",
    pages: [],
  });

  // UI state
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);

  // Edit/View user state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Fetch users and current user data on component mount
  useEffect(() => {
    fetchUsers();
    if (user) {
      getCurrentUserData();
    }
  }, [user]);

  const getCurrentUserData = async () => {
    try {
      const { data, error } = await userService.getUsers();
      if (error) {
        console.error("Failed to get current user data:", error);
        return;
      }

      // Find current user in the users list to get their company ID
      const userData = (data as User[])?.find((u) => u.email === user?.email);
      if (userData) {
        setCurrentUserData(userData);
      }
    } catch (err) {
      console.error("Error getting current user data:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await userService.getUsers();

      if (error) {
        setError(`Failed to fetch users: ${error.message}`);
        return;
      }

      setUsers(data || []);
    } catch (err: any) {
      setError(
        `Unexpected error: ${err.message || "An unknown error occurred"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handlePagesChange = (selectedPages: string[]) => {
    setNewUser((prev) => ({ ...prev, pages: selectedPages }));
  };

  const resetForm = () => {
    setNewUser({
      email: "",
      name: "",
      role: "User",
      pages: [],
    });
    setError("");
    setSuccess("");
  };

  const closeAllModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedUser(null);
    setEditingUserId(null);
    resetForm();
  };

  const handleAddUser = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setNewUser({
      email: user.email || "",
      name: user.name || "",
      role: user.role || "User",
      pages: user.pages || [],
    });
    setEditingUserId(user.id);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    // Modified code to delete the user's row from the Supabase table
    const { error } = await userService.deleteUser(userId);

    if (error) {
      console.error("Error deleting user: ", error);
      return;
    }
    await fetchUsers();

    // Show a success message or perform other actions as needed
    // ...
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleSubmitUser = async (isEdit: boolean = false) => {
    try {
      setError("");
      setSuccess("");

      if (!newUser.email) {
        setError("Email and name are required");
        return;
      }

      if (isEdit && editingUserId) {
        // Update existing user
        const updateData: UserUpdate = {
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          pages: newUser.pages.length > 0 ? newUser.pages : null,
          updatedAt: new Date().toISOString(),
        };

        const { data, error: updateError } = await userService.updateUser(
          editingUserId,
          updateData
        );

        if (updateError) {
          setError(`Failed to update user: ${updateError.message}`);
          return;
        }

        setSuccess("User updated successfully!");
      } else {
        // Check if we have current user's company ID
        if (!currentUserData?.companyId) {
          setError(
            "Unable to determine company. Please refresh and try again."
          );
          return;
        }

        // Create new user
        const userData: UserInsert = {
          id: crypto.randomUUID(),
          email: newUser.email,
          name: newUser.name || null,
          avatar: null,
          role: newUser.role,
          pages: newUser.pages.length > 0 ? newUser.pages : null,
          companyId: currentUserData.companyId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const { data, error: createError } = await userService.createUser(
          userData
        );

        if (createError) {
          setError(`Failed to create user: ${createError.message}`);
          return;
        }

        setSuccess("User created successfully!");
      }

      // Refresh users list and close modal
      await fetchUsers();
      closeAllModals();
    } catch (err: any) {
      setError(
        `Unexpected error: ${err.message || "An unknown error occurred"}`
      );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Multi-select component for pages
  const PagesMultiSelect = ({
    selectedPages,
    onChange,
    id,
  }: {
    selectedPages: string[];
    onChange: (pages: string[]) => void;
    id: string;
  }) => {
    const allPageValues = AVAILABLE_PAGES.map((page) => page.value);
    const isAllSelected =
      allPageValues.length > 0 &&
      allPageValues.every((page) => selectedPages.includes(page));
    const isPartiallySelected =
      selectedPages.length > 0 && selectedPages.length < allPageValues.length;

    const handlePageToggle = (pageValue: string) => {
      const updatedPages = selectedPages.includes(pageValue)
        ? selectedPages.filter((p) => p !== pageValue)
        : [...selectedPages, pageValue];
      onChange(updatedPages);
    };

    const handleSelectAll = () => {
      if (isAllSelected) {
        // If all are selected, deselect all
        onChange([]);
      } else {
        // Select all pages
        onChange(allPageValues);
      }
    };

    return (
      <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
        <div className="space-y-2">
          {/* Select All option */}
          <label className="flex items-center space-x-2 pb-2 border-b border-gray-200">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) input.indeterminate = isPartiallySelected;
              }}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-900">
              {isAllSelected ? "Deselect All Pages" : "Select All Pages"}
            </span>
          </label>

          {/* Individual page options */}
          {AVAILABLE_PAGES.map((page) => (
            <label key={page.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedPages.includes(page.value)}
                onChange={() => handlePageToggle(page.value)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">{page.label}</span>
            </label>
          ))}
        </div>
        {selectedPages.length === 0 && (
          <p className="text-xs text-gray-500 mt-2">No pages selected</p>
        )}
        {selectedPages.length > 0 && (
          <p className="text-xs text-gray-600 mt-2">
            {selectedPages.length} page{selectedPages.length > 1 ? "s" : ""}{" "}
            selected
            {isAllSelected && " (All pages)"}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="p-3">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold mt-4">User Management</h1>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">Loading users...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">No users found</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Pages</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>
                  <button
                    onClick={handleAddUser}
                    className="bg-blue-600 hover:bg-blue-700 text-white hidden md:block text-nowrap p-2 mx-auto my-auto font-medium rounded-md"
                  >
                    Add New User
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || "N/A"}
                  </TableCell>
                  <TableCell>{user.email || "N/A"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.role === "Admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role || "User"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.pages && user.pages.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.pages.slice(0, 2).map((page) => (
                          <span
                            key={page}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                          >
                            {AVAILABLE_PAGES.find((p) => p.value === page)
                              ?.label || page}
                          </span>
                        ))}
                        {user.pages.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                            +{user.pages.length - 2} more
                          </span>
                        )}
                      </div>
                    ) : (
                      "No pages"
                    )}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="bg-blue-500 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded-md"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="bg-yellow-500 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded-md"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-500 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded-md"
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <button
        onClick={handleAddUser}
        className="bg-blue-600 hover:bg-blue-700 text-white block md:hidden mt-4 text-nowrap p-2 mx-auto my-auto font-medium rounded-md"
      >
        Add New User
      </button>
      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="add-email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="add-email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="add-name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="add-name"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="add-role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="add-role"
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="edit-pages"
                className="block text-sm font-medium text-gray-700"
              >
                Allowed Pages
              </label>
              <div className="mt-1">
                <PagesMultiSelect
                  selectedPages={newUser.pages}
                  onChange={handlePagesChange}
                  id="edit-pages"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmitUser(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Add User
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="edit-email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="edit-email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="edit-name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="edit-role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="edit-role"
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="edit-pages"
                className="block text-sm font-medium text-gray-700"
              >
                Allowed Pages
              </label>
              <div className="mt-1">
                <PagesMultiSelect
                  selectedPages={newUser.pages}
                  onChange={handlePagesChange}
                  id="edit-pages"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmitUser(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Update User
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedUser.name || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedUser.email || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <span
                  className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                    selectedUser.role === "Admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selectedUser.role || "User"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Allowed Pages
                </label>
                <div className="mt-1">
                  {selectedUser.pages && selectedUser.pages.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.pages.map((page) => (
                        <span
                          key={page}
                          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {AVAILABLE_PAGES.find((p) => p.value === page)
                            ?.label || page}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No pages assigned</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company ID
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedUser.companyId || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Created At
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(selectedUser.createdAt)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Updated
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(selectedUser.updatedAt)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
