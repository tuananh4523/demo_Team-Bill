"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";

// ================= Types =================
export enum MemberStatus {
  Active = "Hoạt động",
  Inactive = "Ngưng",
}

type StatusFilter = "Tất cả" | MemberStatus;

export type Member = {
  id: number;
  name: string;
  role: string;
  email: string;
  status: MemberStatus;
};

export type Group = {
  id: number;
  name: string;
  members: Member[];
};

// ================= Sample Data =================
const initialGroups: Group[] = [
  {
    id: 1,
    name: "Nhóm A",
    members: [
      {
        id: 1,
        name: "John Doe",
        role: "Leader",
        email: "john@example.com",
        status: MemberStatus.Active,
      },
      {
        id: 2,
        name: "Mary Jane",
        role: "Member",
        email: "mary@example.com",
        status: MemberStatus.Active,
      },
    ],
  },
  {
    id: 2,
    name: "Nhóm B",
    members: [
      {
        id: 3,
        name: "Alex Nguyen",
        role: "Member",
        email: "alex@example.com",
        status: MemberStatus.Inactive,
      },
    ],
  },
];

export default function TeamMembersPage() {
  const [groups, setGroups] = useState<Group[]>(() => {
    const stored = localStorage.getItem("groups");
    return stored ? JSON.parse(stored) : initialGroups;
  });

  useEffect(() => {
    localStorage.setItem("groups", JSON.stringify(groups));
  }, [groups]);

  // Modal state
  const [isGroupModal, setIsGroupModal] = useState(false);
  const [isMemberModal, setIsMemberModal] = useState(false);
  const [isConfirmModal, setIsConfirmModal] = useState(false);

  // Selection state
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);

  // Confirm state
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  // Controlled form cho Member
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState<MemberStatus>(
    MemberStatus.Active
  );

  // Controlled form cho Group
  const [formGroupName, setFormGroupName] = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Tất cả");

  // ================= CRUD =================
  const handleAddGroup = () => {
    if (!formGroupName.trim()) return;
    const newGroup: Group = {
      id: Date.now(),
      name: formGroupName,
      members: [],
    };
    setGroups([...groups, newGroup]);
  };

  const handleUpdateGroup = () => {
    if (!editGroup) return;
    setGroups(
      groups.map((g) =>
        g.id === editGroup.id ? { ...g, name: formGroupName } : g
      )
    );
  };

  const handleDeleteGroup = (id: number) => {
    setGroups(groups.filter((g) => g.id !== id));
  };

  const handleAddMember = (groupId: number) => {
    if (!formName.trim()) return;
    const newMember: Member = {
      id: Date.now(),
      name: formName,
      role: formRole,
      email: formEmail,
      status: formStatus,
    };
    setGroups(
      groups.map((g) =>
        g.id === groupId ? { ...g, members: [...g.members, newMember] } : g
      )
    );
  };

  const handleUpdateMember = (groupId: number) => {
    if (!editMember) return;
    const updated: Member = {
      ...editMember,
      name: formName,
      role: formRole,
      email: formEmail,
      status: formStatus,
    };
    setGroups(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              members: g.members.map((m) =>
                m.id === updated.id ? updated : m
              ),
            }
          : g
      )
    );
  };

  const handleDeleteMember = (groupId: number, memberId: number) => {
    setGroups(
      groups.map((g) =>
        g.id === groupId
          ? { ...g, members: g.members.filter((m) => m.id !== memberId) }
          : g
      )
    );
  };

  // ================= Save =================
  const handleSaveMember = () => {
    if (!selectedGroup) return;
    if (editMember) {
      handleUpdateMember(selectedGroup.id);
    } else {
      handleAddMember(selectedGroup.id);
    }
    setIsMemberModal(false);
  };

  const handleSaveGroup = () => {
    if (editGroup) {
      handleUpdateGroup();
    } else {
      handleAddGroup();
    }
    setIsGroupModal(false);
  };

  // ================= Confirm =================
  const openConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setIsConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction) confirmAction();
    setIsConfirmModal(false);
  };

  // ================= Filter =================
  const filterMembers = (members: Member[]) => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "Tất cả" ? true : m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-800">
      <div className="mb-4">
        <Breadcrumb />
      </div>
      <h1 className="text-2xl font-semibold mb-6">Quản lý nhóm & thành viên</h1>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full md:w-1/2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="border p-2 rounded w-full md:w-1/4"
        >
          <option value="Tất cả">Tất cả</option>
          <option value={MemberStatus.Active}>Hoạt động</option>
          <option value={MemberStatus.Inactive}>Ngưng</option>
        </select>
      </div>

      <button
        onClick={() => {
          setEditGroup(null);
          setFormGroupName("");
          setIsGroupModal(true);
        }}
        className="mb-4 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-700"
      >
        + Thêm nhóm
      </button>

      {/* List Groups */}
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">{group.name}</h2>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => {
                    setEditGroup(group);
                    setFormGroupName(group.name);
                    setIsGroupModal(true);
                  }}
                >
                  Sửa nhóm
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() =>
                    openConfirm(
                      `Bạn có chắc muốn xóa nhóm "${group.name}"?`,
                      () => handleDeleteGroup(group.id)
                    )
                  }
                >
                  Xóa nhóm
                </button>
              </div>
            </div>

            {/* Table Members */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Tên</th>
                    <th className="p-2 border">Vai trò</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Trạng thái</th>
                    <th className="p-2 border text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filterMembers(group.members).map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50">
                      <td className="p-2 border">{member.name}</td>
                      <td className="p-2 border">{member.role}</td>
                      <td className="p-2 border">{member.email}</td>
                      <td className="p-2 border">
                        <span
                          className={`px-2 py-1 rounded text-xs text-white ${
                            member.status === MemberStatus.Active
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="p-2 border text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                            onClick={() => {
                              setSelectedGroup(group);
                              setEditMember(member);
                              setFormName(member.name);
                              setFormRole(member.role);
                              setFormEmail(member.email);
                              setFormStatus(member.status);
                              setIsMemberModal(true);
                            }}
                          >
                            Sửa
                          </button>
                          <button
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                            onClick={() =>
                              openConfirm(
                                `Bạn có chắc muốn xóa thành viên "${member.name}"?`,
                                () => handleDeleteMember(group.id, member.id)
                              )
                            }
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filterMembers(group.members).length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-4 text-center text-gray-500 italic"
                      >
                        Không có thành viên phù hợp
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => {
                setSelectedGroup(group);
                setEditMember(null);
                setFormName("");
                setFormRole("");
                setFormEmail("");
                setFormStatus(MemberStatus.Active);
                setIsMemberModal(true);
              }}
              className="mt-3 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-700"
            >
              + Thêm thành viên
            </button>
          </div>
        ))}
      </div>

      {/* Modal thêm/sửa thành viên */}
      {isMemberModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">
              {editMember ? "Sửa thành viên" : "Thêm thành viên"}
            </h2>

            <input
              type="text"
              placeholder="Tên"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full mb-2 border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Vai trò"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              className="w-full mb-2 border p-2 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="w-full mb-2 border p-2 rounded"
            />
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as MemberStatus)}
              className="w-full mb-4 border p-2 rounded"
            >
              <option value={MemberStatus.Active}>Hoạt động</option>
              <option value={MemberStatus.Inactive}>Ngưng</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsMemberModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveMember}
                className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm/sửa nhóm */}
      {isGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow p-6 w-80">
            <h2 className="text-lg font-semibold mb-4">
              {editGroup ? "Sửa nhóm" : "Thêm nhóm"}
            </h2>
            <input
              type="text"
              placeholder="Tên nhóm"
              value={formGroupName}
              onChange={(e) => setFormGroupName(e.target.value)}
              className="w-full mb-4 border p-2 rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsGroupModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveGroup}
                className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận */}
      {isConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Xác nhận</h2>
            <p className="mb-6">{confirmMessage}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsConfirmModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
