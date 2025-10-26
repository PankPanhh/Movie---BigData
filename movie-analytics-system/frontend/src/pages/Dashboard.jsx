// pages/Dashboard.jsx (ĐÃ SỬA LỖI)
import React from "react";
import StatsCards from "../components/StatsCards";
import ChartGenre from "../components/ChartGenre";
import ChartYear from "../components/ChartYear";
import RecentComments from "../components/RecentComments";
import TheaterList from "../components/TheaterList";
import UserList from "../components/UserList";

export default function Dashboard() {
  return (
    // Xóa 'container mx-auto max-w-7xl' để nó fill toàn bộ
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      {/* Hàng 1: Các thẻ KPI */}
      <StatsCards />

      {/* Hàng 2: Các biểu đồ chính (Wrapper đã bị xóa style) */}
      <div className="grid grid-cols-12 gap-8 mb-8 mt-8">
        <div className="col-span-12 lg:col-span-4 h-full">
          <ChartGenre />
        </div>
        <div className="col-span-12 lg:col-span-8 h-full">
          <ChartYear />
        </div>
      </div>

      {/* Hàng 3: Các widget danh sách (Wrapper đã bị xóa style) */}
      <div className="grid grid-cols-12 gap-8 mb-8">
        <div className="col-span-12 lg:col-span-4 h-full">
          <RecentComments />
        </div>
        <div className="col-span-12 lg:col-span-4 h-full">
          <TheaterList />
        </div>
        <div className="col-span-12 lg:col-span-4 h-full">
          <UserList />
        </div>
      </div>
    </div>
  );
}