"use client";

import { useSession } from "next-auth/react";
import {
  Users,
  Package,
  DollarSign,
  ShoppingBag,
  Settings,
  Clock,
  ChevronRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
interface DashboardCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  link: string;
}
export default function AdminDashboard() {
  const { data: session } = useSession();
  const dashboardCards: DashboardCard[] = [
    {
      title: "Total Sales",
      value: "₹" + 0,
      icon: <DollarSign className="w-8 h-8 text-green-600" />,
      link: "/admin/sales",
    },
    {
      title: "Total Orders",
      value: 0,
      icon: <ShoppingBag className="w-8 h-8 text-blue-600" />,
      link: "/admin/orders",
    },
    {
      title: "Total Products",
      value: 0,
      icon: <Package className="w-8 h-8 text-purple-600" />,
      link: "/admin/products",
    },
    {
      title: "Total Customers",
      value: 0,
      icon: <Users className="w-8 h-8 text-orange-600" />,
      link: "/admin/customers",
    },
  ];

  const recentOrders = [
    {
      id: 1,
      customer: "John Doe",
      avatar: "/avatars/avatar1.png",
      date: "2024-06-10",
      amount: 1200,
      status: "completed",
    },
    {
      id: 2,
      customer: "Jane Smith",
      avatar: "/avatars/avatar2.png",
      date: "2024-06-09",
      amount: 800,
      status: "pending",
    },
    {
      id: 3,
      customer: "Alice Johnson",
      avatar: "/avatars/avatar3.png",
      date: "2024-06-08",
      amount: 950,
      status: "processing",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <Settings className="w-6 h-6" />
            </button>
            {session?.user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Welcome,</span>
                <span className="font-medium">{session.user.name}</span>
              </div>
            )}
          </div>
        </div>
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/dashboard/add-new-product">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-gray-400 group">
              <div className="flex flex-col items-center justify-center h-full space-y-2">
                <div className="p-3 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                  <Plus className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-gray-600 font-medium">Add New Product</p>
              </div>
            </div>
          </Link>
          {dashboardCards.map((card, index) => (
            <Link href={card.link} key={index}>
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-gray-500 text-sm">{card.title}</h3>
                    <p className="text-2xl font-semibold mt-1">{card.value}</p>
                  </div>
                  {card.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>
        {/* Recent Orders Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    <Image
                      src={order.avatar}
                      alt={order.customer}
                      width={40}
                      height={40}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{order.customer}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {order.date}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{order.amount}</p>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${order.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                      }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
