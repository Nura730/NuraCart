import { useState, useEffect } from "react";
import { dummyAddressData } from "../assets/assets";
import { MapPinIcon, Trash2Icon, PlusIcon, Home, CheckIcon } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

interface Address {
  _id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
  lat?: number;
  lng?: number;
}

const Addresses = () => {
  const [addresses, setAddresses] = useState<Address[]>(() => {
    const saved = localStorage.getItem("app_addresses");
    return saved ? JSON.parse(saved) : dummyAddressData;
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState("Home");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    localStorage.setItem("app_addresses", JSON.stringify(addresses));
  }, [addresses]);

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr._id === id,
      }))
    );
    toast.success("Default address updated!");
  };

  const handleDelete = (id: string) => {
    const addressToDelete = addresses.find((addr) => addr._id === id);
    if (addressToDelete?.isDefault && addresses.length > 1) {
      toast.error("Set another address as default before deleting this one.");
      return;
    }
    setAddresses((prev) => prev.filter((addr) => addr._id !== id));
    toast.success("Address removed successfully!");
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      toast.error("Please fill in all address fields.");
      return;
    }

    const newId = "addr_" + Math.random().toString(36).substr(2, 9);
    const newAddress: Address = {
      _id: newId,
      label,
      address,
      city,
      state,
      zip,
      isDefault: isDefault || addresses.length === 0,
      lat: 40.7128, // Mock coordinates
      lng: -74.006,
    };

    setAddresses((prev) => {
      let updated = prev;
      if (newAddress.isDefault) {
        updated = prev.map((addr) => ({ ...addr, isDefault: false }));
      }
      return [...updated, newAddress];
    });

    toast.success("New address added!");
    // Reset Form
    setAddress("");
    setCity("");
    setState("");
    setZip("");
    setIsDefault(false);
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-app-cream py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
          <Link to="/" className="hover:text-app-green transition-colors">
            <Home className="size-4" />
          </Link>
          <span>/</span>
          <span className="text-app-green font-medium">Addresses</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-app-green">Address Book</h1>
            <p className="text-sm text-app-text-light mt-1">Manage your delivery locations for faster checkout</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-app-orange text-white text-sm font-semibold rounded-xl hover:bg-app-orange-dark transition-all shadow-xs"
          >
            <PlusIcon className="size-4" /> {showAddForm ? "Cancel" : "Add Address"}
          </button>
        </div>

        {/* Add Address Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl p-6 border border-app-border mb-8 animate-fade-in">
            <h3 className="text-lg font-semibold text-app-green mb-4">New Address</h3>
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-app-text mb-1">Address Label</label>
                  <select
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-app-cream rounded-xl border border-app-border focus:border-app-green focus:outline-none cursor-pointer"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-text mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="123 Main St, Apt 4B"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-app-cream rounded-xl border border-app-border focus:border-app-green focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-app-text mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-app-cream rounded-xl border border-app-border focus:border-app-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-text mb-1">State</label>
                  <input
                    type="text"
                    required
                    placeholder="NY"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-app-cream rounded-xl border border-app-border focus:border-app-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-text mb-1">ZIP Code</label>
                  <input
                    type="text"
                    required
                    placeholder="10001"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-app-cream rounded-xl border border-app-border focus:border-app-green focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-app-green focus:ring-app-green size-4 border-app-border"
                />
                <label htmlFor="isDefault" className="text-sm text-app-text cursor-pointer select-none">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-app-border text-sm font-semibold rounded-xl text-app-text-light hover:bg-app-cream transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-app-green text-white text-sm font-semibold rounded-xl hover:bg-app-green-light transition-all"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses Grid */}
        <div className="grid gap-4">
          {addresses.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-app-border">
              <MapPinIcon className="size-12 text-app-text-light/35 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-app-green">No addresses saved</h3>
              <p className="text-sm text-app-text-light mb-4">Please add a delivery address to start checkout.</p>
            </div>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr._id}
                className={`bg-white rounded-2xl p-5 border transition-all flex items-start justify-between gap-4 ${
                  addr.isDefault ? "border-app-green ring-1 ring-app-green" : "border-app-border hover:shadow-xs"
                }`}
              >
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-app-cream rounded-xl text-app-green">
                    <MapPinIcon className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-app-green">{addr.label}</h4>
                      {addr.isDefault && (
                        <span className="flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold bg-green-100 text-green-700 rounded-full">
                          <CheckIcon className="size-3" /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-app-text mt-1.5">{addr.address}</p>
                    <p className="text-xs text-app-text-light mt-0.5">
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="px-3 py-1.5 border border-app-border text-xs font-semibold text-app-text-light hover:text-app-green hover:border-app-green rounded-lg transition-all"
                    >
                      Make Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="p-2 text-app-text-light hover:text-app-error hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Address"
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Addresses;
