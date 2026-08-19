"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, CreditCard, Smartphone, CheckCircle, ArrowLeft, ShoppingBag, MessageSquare } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

type CheckoutStep = "contact" | "delivery" | "address" | "payment" | "review" | "success";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "233598010104";

export default function CheckoutPage() {
  const { cartItems, cartSubtotal, isFreeDelivery, clearCart } = useCart();
  const { showToast } = useUI();

  const [step, setStep] = useState<CheckoutStep>("contact");
  const [orderNumber, setOrderNumber] = useState("");

  // Form State
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
  });

  const [deliveryMethod, setDeliveryMethod] = useState<
    "accra-standard" | "accra-express" | "outside-accra" | "rider-pickup"
  >("accra-standard");

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    streetAddress: "",
    city: "",
    region: "Greater Accra",
  });

  const [paymentMethod, setPaymentMethod] = useState<"momo" | "card" | "pod">("momo");
  
  // MoMo Form
  const [momoNumber, setMomoNumber] = useState("");
  const [momoNetwork, setMomoNetwork] = useState("mtn");

  // Card Form
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Shipping Fee Calculations
  const getShippingFee = () => {
    switch (deliveryMethod) {
      case "accra-express":
        return 90;
      case "outside-accra":
        return 120;
      case "rider-pickup":
        return 0;
      case "accra-standard":
      default:
        return isFreeDelivery ? 0 : 50;
    }
  };

  const getShippingLabel = () => {
    switch (deliveryMethod) {
      case "accra-standard":
        return "Accra Standard (1-2 Days)";
      case "accra-express":
        return "Accra Express (Same Day)";
      case "outside-accra":
        return "Outside Accra (2-4 Days)";
      case "rider-pickup":
        return "Pickup & Send Rider";
    }
  };

  const shippingFee = getShippingFee();
  const orderTotal = cartSubtotal + shippingFee;

  // Validation & Next Handlers
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInfo.email || !contactInfo.phone) {
      showToast("Please fill in all contact details.", "info");
      return;
    }
    // Simple Email check
    if (!contactInfo.email.includes("@")) {
      showToast("Please enter a valid email address.", "info");
      return;
    }
    setStep("delivery");
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deliveryMethod === "rider-pickup") {
      setStep("payment");
    } else {
      setStep("address");
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.fullName || !shippingAddress.streetAddress || !shippingAddress.city) {
      showToast("Please fill in all address details.", "info");
      return;
    }
    setStep("payment");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "momo" && !momoNumber) {
      showToast("Please enter your MoMo number.", "info");
      return;
    }
    if (paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardCvv)) {
      showToast("Please fill in all card details.", "info");
      return;
    }
    setStep("review");
  };

  const handlePlaceOrder = () => {
    const randomOrderNum = "JAS-" + Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(randomOrderNum);
    setStep("success");
    showToast("Order placed successfully!");
    // We delay clearing the cart slightly to let success step load details first,
    // but we can clear it immediately!
    setTimeout(() => {
      clearCart();
    }, 100);
  };

  if (cartItems.length === 0 && step !== "success") {
    return (
      <div className="bg-brand-bg min-h-screen py-16 flex items-center justify-center">
        <div className="text-center px-4 max-w-sm">
          <div className="w-16 h-16 bg-brand-beige rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-6 w-6 text-brand-taupe" />
          </div>
          <h2 className="font-serif text-xl text-brand-charcoal mb-2">No Items in Checkout</h2>
          <p className="font-sans text-xs text-brand-taupe mb-8">
            Your shopping bag is empty. Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="bg-brand-burgundy text-brand-bg px-8 py-3 rounded-full font-sans text-xs font-bold tracking-widest uppercase hover:bg-brand-rose transition-colors"
          >
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg min-h-screen pb-20 md:pb-12 text-brand-charcoal">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Breadcrumbs items={[{ label: "Checkout" }]} />

        {step !== "success" ? (
          <div className="flex flex-col lg:flex-row gap-8 mt-6">
            {/* Left Column: Checkout Steps Form */}
            <div className="w-full lg:w-2/3 bg-white border border-brand-border/40 rounded-lg shadow-card p-6 md:p-8">
              {/* Stepper Tabs Visual */}
              <div className="flex items-center gap-1.5 md:gap-3 text-[10px] font-sans font-bold uppercase tracking-wider text-brand-taupe mb-8 overflow-x-auto no-scrollbar pb-3 border-b border-brand-border/50">
                <span className={step === "contact" ? "text-brand-burgundy" : ""}>Contact</span>
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                <span className={step === "delivery" ? "text-brand-burgundy" : ""}>Delivery</span>
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                {deliveryMethod !== "rider-pickup" && (
                  <>
                    <span className={step === "address" ? "text-brand-burgundy" : ""}>Address</span>
                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                  </>
                )}
                <span className={step === "payment" ? "text-brand-burgundy" : ""}>Payment</span>
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                <span className={step === "review" ? "text-brand-burgundy" : ""}>Review</span>
              </div>

              {/* Step 1: Contact Form */}
              {step === "contact" && (
                <form onSubmit={handleContactSubmit} className="space-y-6 fade-in">
                  <h2 className="font-serif text-xl mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-xs font-bold uppercase tracking-wider">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        placeholder="e.g. kobby@gmail.com"
                        className="bg-brand-beige border border-brand-border rounded py-3 px-4 text-sm focus:outline-none focus:border-brand-burgundy font-sans"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-xs font-bold uppercase tracking-wider">
                        WhatsApp/Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                        placeholder="e.g. +233 50 123 4567"
                        className="bg-brand-beige border border-brand-border rounded py-3 px-4 text-sm focus:outline-none focus:border-brand-burgundy font-sans"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-brand-burgundy text-brand-bg px-8 py-3.5 rounded-full font-sans text-xs font-bold tracking-widest uppercase hover:bg-brand-rose transition-colors shadow-sm w-full md:w-fit"
                  >
                    CONTINUE TO DELIVERY
                  </button>
                </form>
              )}

              {/* Step 2: Delivery Method */}
              {step === "delivery" && (
                <form onSubmit={handleDeliverySubmit} className="space-y-6 fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-xl">Delivery Options</h2>
                    <button
                      type="button"
                      onClick={() => setStep("contact")}
                      className="text-xs font-sans text-brand-taupe hover:text-brand-burgundy flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  </div>

                  <div className="space-y-3 font-sans">
                    <label className="flex items-center justify-between p-4 border border-brand-border hover:border-brand-taupe rounded cursor-pointer bg-white">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="delivery-method"
                          checked={deliveryMethod === "accra-standard"}
                          onChange={() => setDeliveryMethod("accra-standard")}
                          className="accent-brand-burgundy h-4 w-4"
                        />
                        <div>
                          <span className="text-sm font-semibold block text-brand-charcoal">
                            Accra Standard Delivery
                          </span>
                          <span className="text-xs text-brand-taupe">Takes 1-2 days</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold">
                        {isFreeDelivery ? "FREE" : "GH₵50.00"}
                      </span>
                    </label>

                    <label className="flex items-center justify-between p-4 border border-brand-border hover:border-brand-taupe rounded cursor-pointer bg-white">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="delivery-method"
                          checked={deliveryMethod === "accra-express"}
                          onChange={() => setDeliveryMethod("accra-express")}
                          className="accent-brand-burgundy h-4 w-4"
                        />
                        <div>
                          <span className="text-sm font-semibold block text-brand-charcoal">
                            Accra Express Same-Day
                          </span>
                          <span className="text-xs text-brand-taupe">Orders before 1PM</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold">GH₵90.00</span>
                    </label>

                    <label className="flex items-center justify-between p-4 border border-brand-border hover:border-brand-taupe rounded cursor-pointer bg-white">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="delivery-method"
                          checked={deliveryMethod === "outside-accra"}
                          onChange={() => setDeliveryMethod("outside-accra")}
                          className="accent-brand-burgundy h-4 w-4"
                        />
                        <div>
                          <span className="text-sm font-semibold block text-brand-charcoal">
                            Delivery Outside Accra
                          </span>
                          <span className="text-xs text-brand-taupe">Takes 2-4 days via transport</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold">GH₵120.00</span>
                    </label>

                    <label className="flex items-center justify-between p-4 border border-brand-border hover:border-brand-taupe rounded cursor-pointer bg-white">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="delivery-method"
                          checked={deliveryMethod === "rider-pickup"}
                          onChange={() => setDeliveryMethod("rider-pickup")}
                          className="accent-brand-burgundy h-4 w-4"
                        />
                        <div>
                          <span className="text-sm font-semibold block text-brand-charcoal">
                            Pickup (Send Your Own Rider)
                          </span>
                          <span className="text-xs text-brand-taupe">From East Legon boutique</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold">FREE</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="bg-brand-burgundy text-brand-bg px-8 py-3.5 rounded-full font-sans text-xs font-bold tracking-widest uppercase hover:bg-brand-rose transition-colors shadow-sm w-full md:w-fit"
                  >
                    CONTINUE
                  </button>
                </form>
              )}

              {/* Step 3: Shipping Address */}
              {step === "address" && (
                <form onSubmit={handleAddressSubmit} className="space-y-6 fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-xl">Shipping Address</h2>
                    <button
                      type="button"
                      onClick={() => setStep("delivery")}
                      className="text-xs font-sans text-brand-taupe hover:text-brand-burgundy flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-xs font-bold uppercase tracking-wider">
                        Recipient Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                        placeholder="e.g. Sandra Akua"
                        className="bg-brand-beige border border-brand-border rounded py-3 px-4 text-sm focus:outline-none focus:border-brand-burgundy font-sans"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-xs font-bold uppercase tracking-wider">
                        Street Address & Landmarks
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.streetAddress}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, streetAddress: e.target.value })}
                        placeholder="e.g. 15 Boundary Rd, opposite Shell, East Legon"
                        className="bg-brand-beige border border-brand-border rounded py-3 px-4 text-sm focus:outline-none focus:border-brand-burgundy font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-xs font-bold uppercase tracking-wider">
                          City / Town
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          placeholder="e.g. Accra"
                          className="bg-brand-beige border border-brand-border rounded py-3 px-4 text-sm focus:outline-none focus:border-brand-burgundy font-sans"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-xs font-bold uppercase tracking-wider">
                          Region
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.region}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, region: e.target.value })}
                          placeholder="e.g. Greater Accra"
                          className="bg-brand-beige border border-brand-border rounded py-3 px-4 text-sm focus:outline-none focus:border-brand-burgundy font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-brand-burgundy text-brand-bg px-8 py-3.5 rounded-full font-sans text-xs font-bold tracking-widest uppercase hover:bg-brand-rose transition-colors shadow-sm w-full md:w-fit"
                  >
                    CONTINUE TO PAYMENT
                  </button>
                </form>
              )}

              {/* Step 4: Payment Option */}
              {step === "payment" && (
                <form onSubmit={handlePaymentSubmit} className="space-y-6 fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-xl">Payment Method</h2>
                    <button
                      type="button"
                      onClick={() => setStep(deliveryMethod === "rider-pickup" ? "delivery" : "address")}
                      className="text-xs font-sans text-brand-taupe hover:text-brand-burgundy flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("momo")}
                      className={`p-4 border rounded flex flex-col items-center justify-center gap-2 font-sans transition-all ${
                        paymentMethod === "momo"
                          ? "border-brand-burgundy bg-brand-beige ring-1 ring-brand-burgundy font-semibold text-brand-burgundy"
                          : "border-brand-border hover:border-brand-taupe text-brand-taupe"
                      }`}
                    >
                      <Smartphone className="h-6 w-6" />
                      <span className="text-xs">Mobile Money</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-4 border rounded flex flex-col items-center justify-center gap-2 font-sans transition-all ${
                        paymentMethod === "card"
                          ? "border-brand-burgundy bg-brand-beige ring-1 ring-brand-burgundy font-semibold text-brand-burgundy"
                          : "border-brand-border hover:border-brand-taupe text-brand-taupe"
                      }`}
                    >
                      <CreditCard className="h-6 w-6" />
                      <span className="text-xs">Card Payment</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("pod")}
                      className={`p-4 border rounded flex flex-col items-center justify-center gap-2 font-sans transition-all ${
                        paymentMethod === "pod"
                          ? "border-brand-burgundy bg-brand-beige ring-1 ring-brand-burgundy font-semibold text-brand-burgundy"
                          : "border-brand-border hover:border-brand-taupe text-brand-taupe"
                      }`}
                    >
                      <ShoppingBag className="h-6 w-6" />
                      <span className="text-xs">Pay on Delivery</span>
                    </button>
                  </div>

                  {/* MoMo Options */}
                  {paymentMethod === "momo" && (
                    <div className="bg-brand-beige/30 p-5 border border-brand-border rounded space-y-4 fade-in">
                      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                        Mobile Money Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[10px] font-bold uppercase text-brand-taupe">
                            Select Network
                          </label>
                          <select
                            value={momoNetwork}
                            onChange={(e) => setMomoNetwork(e.target.value)}
                            className="bg-white border border-brand-border rounded py-2.5 px-3 text-xs font-sans focus:outline-none"
                          >
                            <option value="mtn">MTN Mobile Money</option>
                            <option value="telecel">Telecel Cash</option>
                            <option value="at">AT Money</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[10px] font-bold uppercase text-brand-taupe">
                            MoMo Number
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="050 123 4567"
                            value={momoNumber}
                            onChange={(e) => setMomoNumber(e.target.value)}
                            className="bg-white border border-brand-border rounded py-2 px-3 text-xs font-sans focus:outline-none"
                          />
                        </div>
                      </div>
                      <p className="font-sans text-[10px] text-brand-taupe leading-relaxed">
                        Note: You will receive a prompt on your phone to input your PIN and authorize this payment after submitting.
                      </p>
                    </div>
                  )}

                  {/* Card Options */}
                  {paymentMethod === "card" && (
                    <div className="bg-brand-beige/30 p-5 border border-brand-border rounded space-y-4 fade-in">
                      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                        Credit / Debit Card details (Paystack Simulation)
                      </h3>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[10px] font-bold uppercase text-brand-taupe">
                          Name on Card
                        </label>
                        <input
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Sandra Akua"
                          className="bg-white border border-brand-border rounded py-2 px-3.5 text-xs font-sans focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[10px] font-bold uppercase text-brand-taupe">
                          Card Number
                        </label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4000 1234 5678 9010"
                          className="bg-white border border-brand-border rounded py-2 px-3.5 text-xs font-sans focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[10px] font-bold uppercase text-brand-taupe">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM / YY"
                            className="bg-white border border-brand-border rounded py-2 px-3 text-xs font-sans focus:outline-none text-center"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[10px] font-bold uppercase text-brand-taupe">
                            CVV
                          </label>
                          <input
                            type="text"
                            required
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="123"
                            maxLength={3}
                            className="bg-white border border-brand-border rounded py-2 px-3 text-xs font-sans focus:outline-none text-center"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* POD option */}
                  {paymentMethod === "pod" && (
                    <div className="bg-brand-beige/35 p-5 border border-brand-border rounded font-sans text-xs text-brand-taupe leading-relaxed fade-in">
                      <p>
                        💡 <span className="font-bold text-brand-charcoal">Pay on Delivery Selected</span>: Please ensure you have cash or mobile money ready when the rider arrives. Accra-only service.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="bg-brand-burgundy text-brand-bg px-8 py-3.5 rounded-full font-sans text-xs font-bold tracking-widest uppercase hover:bg-brand-rose transition-colors shadow-sm w-full md:w-fit"
                  >
                    CONTINUE TO REVIEW
                  </button>
                </form>
              )}

              {/* Step 5: Review & Place Order */}
              {step === "review" && (
                <div className="space-y-6 fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-xl">Review & Confirm</h2>
                    <button
                      type="button"
                      onClick={() => setStep("payment")}
                      className="text-xs font-sans text-brand-taupe hover:text-brand-burgundy flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs border-t border-b border-brand-border/60 py-6">
                    {/* Contact & Shipping */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold uppercase tracking-wider text-brand-charcoal mb-1">
                          Contact Info
                        </h3>
                        <p className="text-brand-taupe">Email: {contactInfo.email}</p>
                        <p className="text-brand-taupe">Phone: {contactInfo.phone}</p>
                      </div>

                      {deliveryMethod !== "rider-pickup" && (
                        <div>
                          <h3 className="font-bold uppercase tracking-wider text-brand-charcoal mb-1">
                            Shipping Address
                          </h3>
                          <p className="text-brand-charcoal font-semibold">{shippingAddress.fullName}</p>
                          <p className="text-brand-tau">{shippingAddress.streetAddress}</p>
                          <p className="text-brand-tau">
                            {shippingAddress.city}, {shippingAddress.region}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Delivery & Payment */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold uppercase tracking-wider text-brand-charcoal mb-1">
                          Delivery Method
                        </h3>
                        <p className="text-brand-taupe">{getShippingLabel()}</p>
                        <p className="text-brand-burgundy font-bold">
                          {shippingFee === 0 ? "FREE" : `GH₵${shippingFee.toFixed(2)}`}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-bold uppercase tracking-wider text-brand-charcoal mb-1">
                          Payment Method
                        </h3>
                        <p className="text-brand-taupe capitalize">
                          {paymentMethod === "momo"
                            ? `Mobile Money (${momoNetwork.toUpperCase()} - ${momoNumber})`
                            : paymentMethod === "card"
                            ? `Credit/Debit Card (${cardNumber.slice(-4)})`
                            : "Pay on Delivery"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    className="bg-brand-burgundy text-brand-bg px-10 py-4 rounded-full font-sans text-sm font-bold tracking-widest uppercase hover:bg-brand-rose transition-colors shadow-lg w-full"
                  >
                    PLACE ORDER (GH₵{orderTotal.toFixed(2)})
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Checkout Summary (Cart Summary) */}
            <div className="w-full lg:w-1/3 bg-white border border-brand-border/40 rounded-lg shadow-card p-6 md:p-8 space-y-6">
              <h3 className="font-serif text-lg text-brand-charcoal tracking-wide border-b border-brand-border pb-4 uppercase">
                Order Items ({cartItems.length})
              </h3>

              {/* Items Mini List */}
              <div className="divide-y divide-brand-border/50 max-h-[350px] overflow-y-auto no-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-3 flex gap-3 first:pt-0 last:pb-0">
                    <div className="relative w-12 aspect-[4/5] bg-brand-beige overflow-hidden rounded border border-brand-border flex-shrink-0">
                      <Image
                        src={item.product.images[0] || "/placeholder.jpg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 overflow-hidden font-sans text-xs">
                      <h4 className="font-serif text-brand-charcoal text-xs truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-brand-taupe text-[10px] mt-0.5">
                        Qty: {item.quantity} • {item.selectedColor.name} • {item.selectedSizeOrVariation}
                      </p>
                      <p className="font-semibold text-brand-charcoal mt-1">
                        GH₵{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="font-sans text-xs divide-y divide-brand-border/40 pt-4 border-t border-brand-border">
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-brand-taupe">Subtotal</span>
                  <span className="font-semibold text-brand-charcoal">
                    GH₵{cartSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-brand-taupe">Delivery</span>
                  <span className="font-semibold text-brand-charcoal">
                    {shippingFee === 0 ? "FREE" : `GH₵${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 text-sm font-bold">
                  <span className="text-brand-charcoal uppercase tracking-wider">Total</span>
                  <span className="text-brand-burgundy text-base">
                    GH₵{orderTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Step Success Screen */
          <div className="max-w-2xl mx-auto mt-12 bg-white border border-brand-border/40 rounded-lg shadow-card p-8 md:p-12 text-center fade-in">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>

            <h1 className="font-serif text-2xl md:text-3xl font-light tracking-wide text-brand-charcoal mb-2">
              Order Confirmed!
            </h1>
            <p className="font-sans text-xs text-brand-burgundy font-bold uppercase tracking-widest mb-6">
              Order Number: {orderNumber}
            </p>

            <p className="font-sans text-sm text-brand-taupe leading-relaxed mb-8 max-w-md mx-auto">
              Thank you for shopping with **JAS**. We have received your order details and are preparing it. A receipt has been sent to your contact email.
            </p>

            {/* Inbound support box */}
            <div className="bg-brand-beige/40 border border-brand-border/60 rounded-md p-5 text-left font-sans text-xs text-brand-taupe mb-8 space-y-2">
              <h3 className="font-bold text-brand-charcoal text-center uppercase tracking-wider mb-2">
                Need Urgent Assistance?
              </h3>
              <p>📍 Shop Location: East Legon, Boundary Road, Accra, Ghana.</p>
              <p>📞 Phone Line: +233 59 801 0104</p>
              <p>💬 WhatsApp: Chat directly to send rider / inquire about pickups.</p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hi JAS! My order number is ${orderNumber}. I would like to schedule a pickup / delivery check.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-burgundy hover:underline font-bold mt-2 pt-1 block text-center w-full justify-center"
              >
                <MessageSquare className="h-4 w-4 fill-current" /> Chat with us on WhatsApp
              </a>
            </div>

            <Link
              href="/shop"
              className="bg-brand-charcoal text-brand-bg hover:bg-brand-burgundy px-10 py-3.5 rounded-full font-sans text-xs font-bold tracking-widest uppercase transition-colors shadow-sm inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
