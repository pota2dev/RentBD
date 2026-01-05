"use client";

export default function RentHistoryPage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-10">
      <h1 className="mb-6 text-3xl font-bold">Rent History</h1>

      <p className="text-zinc-600">
        This page will display all rented properties and their statuses.
      </p>

      <div className="mt-6 rounded bg-white p-4 shadow">
        <p className="font-medium">Sample Record:</p>
        <p>Property: Modern Apartment in Dhanmondi</p>
        <p>Status: Pending</p>
      </div>
    </div>
  );
}
