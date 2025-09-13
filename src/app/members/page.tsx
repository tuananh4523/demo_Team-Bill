"use client";

import { useState } from "react";

type Member = {
  id: number;
  name: string;
  role: string;
  email: string;
  status: "Hoạt động" | "Ngưng";
};

const initialMembers: Member[] = [
  { id: 1, name: "John Doe", role: "Leader", email: "john@example.com", status: "Hoạt động" },
  { id: 2, name: "Mary Jane", role: "Member", email: "mary@example.com", status: "Hoạt động" },
  { id: 3, name: "Alex Nguyen", role: "Member", email: "alex@example.com", status: "Ngưng" },
];

export default function TeamMembersPage() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = (id: number) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-4">Quản lý thành viên nhóm</h1>

      {/* Nút thêm */}
      <button
        onClick={() => setIsOpen(true)}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + Thêm thành viên
      </button>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Tên</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Vai trò</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Trạng thái</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{member.name}</td>
                <td className="px-6 py-4">{member.role}</td>
                <td className="px-6 py-4">{member.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-white text-sm ${
                      member.status === "Hoạt động" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex justify-center gap-2">
                  <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Sửa
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleDelete(member.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm thành viên */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-xl font-bold mb-4">Thêm thành viên</h2>
            <input
              type="text"
              placeholder="Tên"
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Vai trò"
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <select className="w-full mb-4 px-3 py-2 border rounded">
              <option value="Hoạt động">Hoạt động</option>
              <option value="Ngưng">Ngưng</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
