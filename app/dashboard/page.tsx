"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type SheetData = {
  matrix: string[][];
  error?: string;
};

export default function Home() {
  const [data, setData] = useState<SheetData>({
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
      <div className="flex flex-row gap-3 mb-2">
        <Link href="/">
          <button className="text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900">
            Home
          </button>
        </Link>
      </div>

      <div className="w-full max-w-4xl space-y-8">
        {/* Matrix Display as Ordered List */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl text-center font-bold mb-4 text-black">
            Transaction List
          </h2>
          <div className="overflow-x-auto">
            <ol className="list-decimal list-inside space-y-2">
              {data.matrix.map((row, rowIndex) => (
                <li key={`row-${rowIndex}`} className="text-black">
                  {row.map((cell, cellIndex) => (
                    <span key={`cell-${cellIndex}`} className="ml-2">
                      {cell || "(empty)"} |
                    </span>
                  ))}
                </li>
              ))}
              {data.matrix.length === 0 && (
                <li className="text-black">No data available</li>
              )}
            </ol>
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
