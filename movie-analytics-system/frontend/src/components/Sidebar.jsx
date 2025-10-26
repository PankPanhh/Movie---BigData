// components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

// Tiện ích để tạo NavLink
const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    end // Thêm 'end' để NavLink "/" không bị active khi ở trang con
    className={({ isActive }) =>
      `flex items-center p-3 rounded-lg transition-all duration-200 ${
        isActive
          ? "bg-blue-600 text-white shadow-lg"
          : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
      }`
    }
  >
    {/* Icon SVG */}
    <div
      className="w-6 h-6 mr-3"
      dangerouslySetInnerHTML={{ __html: icon }}
    />
    <span className="font-semibold">{label}</span>
  </NavLink>
);

// Định nghĩa Icon (Heroicons)
const icons = {
  dashboard: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12M3.75 3h16.5M3.75 3v11.25A2.25 2.25 0 006 16.5h12M3.75 3h16.5M3.75 3v11.25A2.25 2.25 0 006 16.5h12M3.75 3h16.5M3.75 3v11.25A2.25 2.25 0 006 16.5h12M3.75 3h16.5M3.75 3v11.25A2.25 2.25 0 006 16.5h12m-12 0v5.25A2.25 2.25 0 006 24h12a2.25 2.25 0 002.25-2.25V16.5m-12 0h12" /></svg>`,
  theaters: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>`,
  movies: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" /></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.003c0 1.113.285 2.16.786 3.07M15 19.128c.331.02.661.037.991.055M15 19.128c-1.111 0-2.16-.285-3.07-.786m0 0v.003c0-1.113.285-2.16.786-3.07M12 19.128v-.003c0-1.113-.285-2.16-.786-3.07M12 19.128v.003c0 1.113.285 2.16.786 3.07M12 19.128c.331.02.661.037.991.055M12 19.128c-1.111 0-2.16-.285-3.07-.786m0 0c-1.111 0-2.16-.285-3.07-.786m0 0v.003c0-1.113.285-2.16.786-3.07M9 19.128v-.003c0-1.113-.285-2.16-.786-3.07M9 19.128v.003c0 1.113.285 2.16.786 3.07M9 19.128c.331.02.661.037.991.055M9 19.128c-1.111 0-2.16-.285-3.07-.786m-3.07 0v.003c0-1.113.285-2.16.786-3.07M5.929 19.128c-.331.02-.661.037-.991.055M5.929 19.128v.003c0 1.113.285 2.16.786 3.07M5.929 19.128c-1.111 0-2.16-.285-3.07-.786M3.75 16.128c1.111 0 2.16.285 3.07.786m0 0v-.003c0 1.113-.285 2.16-.786 3.07M3.75 16.128v-.003c0-1.113.285-2.16.786-3.07M3.75 16.128c.331.02.661.037.991.055m14.25-8.819c1.111 0 2.16.285 3.07.786m0 0v-.003c0 1.113-.285 2.16-.786 3.07M18.071 7.309v-.003c0-1.113.285-2.16.786-3.07M18.071 7.309c.331.02.661.037.991.055m-1.111 0c-1.111 0-2.16-.285-3.07-.786m0 0c-1.111 0-2.16-.285-3.07-.786m0 0v.003c0-1.113.285-2.16.786-3.07M15 7.309v.003c0 1.113.285 2.16.786 3.07M15 7.309c.331.02.661.037.991.055M15 7.309c-1.111 0-2.16-.285-3.07-.786M9 7.309v.003c0 1.113.285 2.16.786 3.07M9 7.309v-.003c0-1.113-.285-2.16-.786-3.07M9 7.309c.331.02.661.037.991.055M9 7.309c-1.111 0-2.16-.285-3.07-.786M5.929 7.309v.003c0 1.113.285 2.16.786 3.07M5.929 7.309v-.003c0-1.113-.285-2.16-.786-3.07M5.929 7.309c.331.02.661.037.991.055M5.929 7.309c-1.111 0-2.16-.285-3.07-.786M3.75 7.309c1.111 0 2.16.285 3.07.786m0 0v-.003c0 1.113-.285 2.16-.786 3.07M3.75 7.309v-.003c0-1.113.285-2.16.786-3.07M3.75 7.309c.331.02.661.037.991.055m.003-3.185v.003c0-1.113.285-2.16.786-3.07M3.753 4.124v.003c0 1.113-.285 2.16-.786 3.07M3.753 4.124c.331.02.661.037.991.055M3.753 4.124c-1.111 0-2.16-.285-3.07-.786M9 4.124v.003c0 1.113.285 2.16.786 3.07M9 4.124v-.003c0-1.113-.285-2.16-.786-3.07M9 4.124c.331.02.661.037.991.055M9 4.124c-1.111 0-2.16-.285-3.07-.786m5.25-3.185v.003c0-1.113.285-2.16.786-3.07M14.25 4.124v.003c0 1.113-.285 2.16-.786 3.07M14.25 4.124c.331.02.661.037.991.055M14.25 4.124c-1.111 0-2.16-.285-3.07-.786m5.25 3.185v.003c0-1.113.285-2.16.786-3.07M19.5 4.124v.003c0 1.113-.285 2.16-.786 3.07M19.5 4.124c.331.02.661.037.991.055M19.5 4.124c-1.111 0-2.16-.285-3.07-.786" /></svg>`,
  comments: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
};

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-xl flex-shrink-0 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 flex items-center space-x-3">
        <svg className="w-10 h-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 3.124L18 12M6 12v3.75c0 .621.504 1.125 1.125 1.125H16.875A1.125 1.125 0 0 0 18 15.75V12M6 12v-3.75c0-.621.504-1.125 1.125-1.125H16.875A1.125 1.125 0 0 1 18 8.25V12" />
        </svg>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Rạp Phim</h1>
          <span className="text-xs font-medium text-gray-500">Management System</span>
        </div>
      </div>
      
      <hr className="border-gray-200 mx-4" />

      {/* Nav Section */}
      <nav className="p-4 space-y-2 flex-1">
        <NavItem to="/" icon={icons.dashboard} label="Dashboard" />
        <NavItem to="/theaters" icon={icons.theaters} label="Quản lý Rạp" />
        <NavItem to="/movies" icon={icons.movies} label="Quản lý Phim" />
        <NavItem to="/users" icon={icons.users} label="Quản lý User" />
        <NavItem to="/comments" icon={icons.comments} label="Quản lý Comment" />
      </nav>
    </aside>
  );
}