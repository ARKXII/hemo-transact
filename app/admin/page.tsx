"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type SheetData = {
  individualCells: {
    totalSpending: string | null;
    installment: string | null;
    totalBudget: string | null;
    remainingBudget: string | null;
    currentCredit: string | null;
    budget: string | null;
  };
  matrix: string[][];
  error?: string;
};

export default function Home() {
  const [data, setData] = useState<SheetData>({
    individualCells: {
      totalSpending: "Loading...",
      installment: "Loading...",
      totalBudget: "Loading...",
      remainingBudget: "Loading...",
      currentCredit: "Loading...",
      budget: "Loading...",
    },
    matrix: [],
  });

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data: SheetData) => {
        if (data.error) throw new Error(data.error);
        setData({
          individualCells: {
            totalSpending: data.individualCells.totalSpending || "N/A",
            installment: data.individualCells.installment || "N/A",
            totalBudget: data.individualCells.totalBudget || "N/A",
            remainingBudget: data.individualCells.remainingBudget || "N/A",
            currentCredit: data.individualCells.currentCredit || "N/A",
            budget: data.individualCells.budget || "N/A",
          },
          matrix: data.matrix || [],
        });
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setData((prev) => ({
          ...prev,
          error: err.message,
        }));
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-5">
      <div className="flex flex-row gap-3 mb-6">
        <Link href="/">
          <button className="text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900">
            Home
          </button>
        </Link>
      </div>

      <div className="w-full max-w-6xl space-y-8">
        {/* Financial Overview Cards */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-black">
            Financial Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-3 border rounded-lg bg-blue-50">
              <h3 className="font-semibold text-sm text-blue-700">
                Total Spending
              </h3>
              <p className="font-medium text-lg text-black">
                {data.individualCells.totalSpending}
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-green-50">
              <h3 className="font-semibold text-sm text-green-700">
                Installment
              </h3>
              <p className="font-medium text-lg text-black">
                {data.individualCells.installment}
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-purple-50">
              <h3 className="font-semibold text-sm text-purple-700">
                Total Budget
              </h3>
              <p className="font-medium text-lg text-black">
                {data.individualCells.totalBudget}
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-amber-50">
              <h3 className="font-semibold text-sm text-amber-700">
                Remaining Budget
              </h3>
              <p className="font-medium text-lg text-black">
                {data.individualCells.remainingBudget}
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-red-50">
              <h3 className="font-semibold text-sm text-red-700">
                Current Credit
              </h3>
              <p className="font-medium text-lg text-black">
                {data.individualCells.currentCredit}
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-indigo-50">
              <h3 className="font-semibold text-sm text-indigo-700">Budget</h3>
              <p className="font-medium text-lg">
                {data.individualCells.budget}
              </p>
            </div>
          </div>
        </div>

        {/* Matrix Display */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-black">
            Detailed Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-50">
                <tr>
                  {data.matrix[0]?.map((header, index) => (
                    <th
                      key={`header-${index}`}
                      className="border p-2 font-bold text-black text-left"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.matrix.slice(1).map((row, rowIndex) => (
                  <tr
                    key={`row-${rowIndex}`}
                    className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`cell-${rowIndex}-${cellIndex}`}
                        className="border p-2 text-left text-black"
                      >
                        {cell || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
                {data.matrix.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center p-4 text-black">
                      No detailed data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {data.error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            <h3 className="font-bold">Error:</h3>
            <p>{data.error}</p>
          </div>
        )}
      </div>
    </main>
  );
}
