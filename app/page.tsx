"use client";
import { useState } from "react";

const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;

export default function Home() {
  // Define field configurations with column mappings
  const fieldConfig = [
    { id: "Date", label: "Date ", column: "B", type: "date" },
    {
      id: "Credit Card",
      label: "Credit Card",
      column: "C",
      type: "select",
      options: ["BDO Gold", "SB Wave", "UB UVisa Plat", "Maya"],
    },
    {
      id: "Amount",
      label: "Amount",
      column: "D",
      type: "number",
      inputMode: "decimal",
      step: "0.01",
      min: "0",
    },
    { id: "Description", label: "Description", column: "E", type: "text" },
  ];

  // Format date as YYYY-MM-DD for input field
  const getTodayFormatted = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Initialize state dynamically based on field configurations
  const [fieldValues, setFieldValues] = useState(() => {
    // Create initial state with today's date for field1
    const initialValues = Object.fromEntries(
      fieldConfig.map((field) => {
        // Set field1 to today's date, others to empty string
        return [field.id, field.id === "Date" ? getTodayFormatted() : ""];
      })
    );
    return initialValues;
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFieldValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Create data structure for fields with column mapping
    const formData = {
      fields: fieldConfig.map((field) => ({
        column: field.column,
        value: fieldValues[field.id],
      })),
    };

    const CurrencyInput = ({
      value,
      onChange,
      ...props
    }: {
      value: string | number;
      onChange: (value: string) => void;
      [key: string]: any;
    }) => {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove non-numeric characters except decimal point
        const rawValue = e.target.value.replace(/[^0-9.]/g, "");
        onChange(rawValue);
      };

      return (
        <input
          type="number"
          value={value}
          onChange={handleChange}
          inputMode="decimal"
          step="0.01"
          min="0"
          {...props}
        />
      );
    };

    try {
      const response = await fetch("/api/append-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Data successfully appended to row ${data.rowNumber}!`);
        // Reset form values, keeping today's date for Date field
        setFieldValues({
          ...Object.fromEntries(fieldConfig.map((field) => [field.id, ""])),
          Date: getTodayFormatted(),
        });
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      setMessage(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-5">
      <div className="w-full max-w-md md:max-w-xl p-6 md:p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">
          Enter Transaction
        </h1>

        <form onSubmit={handleSubmit}>
          {fieldConfig.map((field) => (
            <div className="mb-4" key={field.id}>
              <label
                htmlFor={field.id}
                className="block text-sm font-medium text-black mb-1"
              >
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  required
                  id={field.id}
                  name={field.id}
                  value={fieldValues[field.id] || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">---</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "number" ? (
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    ₱
                  </span>
                  <input
                    required
                    type="number"
                    id={field.id}
                    name={field.id}
                    value={fieldValues[field.id] || ""}
                    onChange={handleChange}
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0.00"
                  />
                </div>
              ) : (
                <input
                  required
                  type={field.type}
                  id={field.id}
                  name={field.id}
                  value={fieldValues[field.id] || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {loading ? "Submitting..." : "Submit Form"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-md ${
              message.includes("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}&nbsp;
            {message.includes("Error") ? (
              ""
            ) : (
              <a
                href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0`}
                className="text-blue-500 underline"
              >
                View Sheet
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
