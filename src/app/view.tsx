"use client";

import { useState } from "react";

const mockProperties = [
  {
    id: 1,
    title: "Modern Apartment in Dhanmondi",
    location: "Dhaka",
    price: 18000,
    recommended: true,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
  },
  {
    id: 2,
    title: "Cozy Room near BRAC University",
    location: "Mohakhali",
    price: 12000,
    recommended: true,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
  },
  {
    id: 3,
    title: "Family House in Uttara",
    location: "Uttara",
    price: 25000,
    recommended: false,
    image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c",
  },
];


export default function HomeView() {
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rentHistory, setRentHistory] = useState<any[]>([]);

  const filteredProperties = mockProperties.filter((property) => {
    const matchLocation =
      location === "" ||
      property.location.toLowerCase().includes(location.toLowerCase());

    const matchMin =
      minPrice === "" || property.price >= Number(minPrice);

    const matchMax =
      maxPrice === "" || property.price <= Number(maxPrice);

    return matchLocation && matchMin && matchMax;
  });

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10">
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl text-center">
        <h1 className="text-4xl font-bold text-zinc-900">
          Find Your Perfect Rental with RentBD
        </h1>
        <p className="mt-3 text-zinc-600">
          Search rooms and houses across Bangladesh
        </p>

        {/* Search Box */}
        <div className="mt-8 grid gap-4 rounded-xl bg-white p-6 shadow sm:grid-cols-4">
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded border px-4 py-2"
          />

          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="rounded border px-4 py-2"
          />

          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="rounded border px-4 py-2"
          />

          <button className="rounded bg-black px-4 py-2 text-white">
            Search
          </button>
        </div>
      </section>
      {/* Recommended Section */}
<section className="mx-auto mt-12 max-w-6xl">
  <h2 className="mb-6 text-2xl font-semibold text-zinc-800">
    Recommended for You
  </h2>

  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {mockProperties
      .filter((p) => p.recommended)
      .map((property) => (
        <div
          key={property.id}
          className="overflow-hidden rounded-xl bg-white shadow"
        >
          <img
            src={property.image}
            alt={property.title}
            className="h-48 w-full object-cover"
          />
          <div className="p-4">
            <h3 className="text-lg font-semibold">{property.title}</h3>
            <p className="text-sm text-zinc-500">{property.location}</p>
            <p className="mt-2 font-bold">৳ {property.price}/month</p>
          </div>
        </div>
      ))}
  </div>
</section>

      {/* Property Cards */}
      <section className="mx-auto mt-12 max-w-6xl">
        <h2 className="mb-6 text-2xl font-semibold text-zinc-800">
          Available Properties
        </h2>

        {filteredProperties.length === 0 ? (
          <p className="text-zinc-500">No properties found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="overflow-hidden rounded-xl bg-white shadow"
              >
                <img
                  src={property.image}
                  alt={property.title}
                  className="h-48 w-full object-cover"
                />

                <div className="p-4">
                  <h3 className="text-lg font-semibold">
                    {property.title}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {property.location}
                  </p>
                  <p className="mt-2 font-bold">
                    ৳ {property.price}/month
                  </p>
                  <button
                    onClick={() =>
                      setRentHistory((prev) => [
                        ...prev,
                        { ...property, status: "Pending" },
                      ])
                    }
                    className="mt-3 w-full rounded bg-black py-2 text-white"
                  >
                    Rent Property
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
