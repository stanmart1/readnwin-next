"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface PaymentGateway {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  testMode: boolean;
  apiKeys: {
    publicKey: string;
    secretKey: string;
    webhookSecret?: string;
    hash?: string;
  };
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    accountType: string;
    instructions?: string;
  };
  supportedCurrencies: string[];
  features: string[];
  status: "active" | "inactive" | "error" | "testing";
}

interface PaymentSettings {
  defaultGateway: string;
  supportedGateways: string[];
  currency: string;
  taxRate: number;
  shippingCost: number;
  freeShippingThreshold: number;
  webhookUrl: string;
  testMode: boolean;
}

interface ValidationErrors {
  [gatewayId: string]: {
    [field: string]: string;
  };
}

export default function PaymentGatewayManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingGateway, setSavingGateway] = useState<string | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<{
    [gatewayId: string]: { [field: string]: string };
  }>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    action: string;
    gatewayId: string;
    message: string;
  }>({ show: false, action: "", gatewayId: "", message: "" });

  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([
    {
      id: "flutterwave",
      name: "Flutterwave",
      description: "Leading payment technology company in Africa",
      icon: "ri-global-line",
      enabled: true,
      testMode: false,
      apiKeys: {
        publicKey: "FLWPUBK-9856cdb89cb82f5ce5de30877c7b3a89-X",
        secretKey: "FLWSECK-19415f8daa7a8fd3f74b0d71874cfad1-197781a61d6vt-X",
        webhookSecret: "",
        hash: "19415f8daa7ad132cd7680f7",
      },
      supportedCurrencies: ["NGN", "USD", "EUR", "GBP"],
      features: [
        "Mobile Money",
        "Bank Transfers",
        "Credit Cards",
        "USSD",
        "QR Payments",
      ],
      status: "active",
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      description: "Direct bank transfer with proof of payment upload",
      icon: "ri-bank-line",
      enabled: true,
      testMode: false,
      apiKeys: {
        publicKey: "",
        secretKey: "",
        webhookSecret: "",
      },
      bankAccount: {
        bankName: "Access Bank",
        accountNumber: "0101234567",
        accountName: "Lagsale Online Resources",
        accountType: "Current",
        instructions: "Please include your order number as payment reference",
      },
      supportedCurrencies: ["NGN"],
      features: ["Bank Transfers", "Proof of Payment", "Manual Verification"],
      status: "active",
    },
  ]);

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    defaultGateway: "flutterwave",
    supportedGateways: ["flutterwave", "bank_transfer"],
    currency: "NGN",
    taxRate: 7.5,
    shippingCost: 2000,
    freeShippingThreshold: 50000,
    webhookUrl: "",
    testMode: false,
  });

  useEffect(() => {
    loadPaymentGateways();
  }, []);

  const loadPaymentGateways = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/payment-settings");
      if (response.ok) {
        const data = await response.json();
        if (data.gateways) {
          setPaymentGateways(data.gateways);
        }
        if (data.settings) {
          setPaymentSettings(data.settings);
        }
      }
    } catch (error) {
      console.error("Error loading payment gateways:", error);
      toast.error("Failed to load payment gateway settings");
    } finally {
      setIsLoading(false);
    }
  };

  const validateApiKey = (value: string, type: string): string => {
    if (!value) return `${type} is required`;

    switch (type) {
      case "publicKey":
        if (value.length < 10)
          return "Public key must be at least 10 characters";
        break;
      case "secretKey":
        if (value.length < 10)
          return "Secret key must be at least 10 characters";
        break;
      case "hash":
        if (value && value.length < 8)
          return "Hash must be at least 8 characters";
        break;
    }
    return "";
  };

  const validateGateway = (gateway: PaymentGateway): boolean => {
    const errors: { [field: string]: string } = {};

    if (gateway.id === "flutterwave") {
      const publicKeyError = validateApiKey(
        gateway.apiKeys.publicKey,
        "publicKey",
      );
      const secretKeyError = validateApiKey(
        gateway.apiKeys.secretKey,
        "secretKey",
      );
      const hashError = validateApiKey(gateway.apiKeys.hash || "", "hash");

      if (publicKeyError) errors.publicKey = publicKeyError;
      if (secretKeyError) errors.secretKey = secretKeyError;
      if (hashError) errors.hash = hashError;
    }

    if (gateway.id === "bank_transfer" && gateway.bankAccount) {
      if (!gateway.bankAccount.bankName)
        errors.bankName = "Bank name is required";
      if (!gateway.bankAccount.accountNumber)
        errors.accountNumber = "Account number is required";
      if (!gateway.bankAccount.accountName)
        errors.accountName = "Account name is required";
    }

    setValidationErrors((prev) => ({ ...prev, [gateway.id]: errors }));
    return Object.keys(errors).length === 0;
  };

  const saveGateway = async (gateway: PaymentGateway) => {
    if (!validateGateway(gateway)) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    setSavingGateway(gateway.id);
    try {
      const response = await fetch("/api/admin/payment-settings/gateway", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gateway),
      });

      if (response.ok) {
        toast.success(`${gateway.name} configuration saved successfully!`);
        // Update the gateway status to active if save was successful
        setPaymentGateways((prev) =>
          prev.map((g) =>
            g.id === gateway.id ? { ...g, status: "active" } : g,
          ),
        );
      } else {
        const error = await response.json();
        toast.error(`Failed to save ${gateway.name}: ${error.message}`);
      }
    } catch (error) {
      console.error("Error saving gateway:", error);
      toast.error(`Failed to save ${gateway.name} configuration`);
    } finally {
      setSavingGateway(null);
    }
  };

  const updateApiKey = (gatewayId: string, keyType: string, value: string) => {
    setPaymentGateways((prev) =>
      prev.map((gateway) =>
        gateway.id === gatewayId
          ? {
              ...gateway,
              apiKeys: {
                ...gateway.apiKeys,
                [keyType]: value,
              },
            }
          : gateway,
      ),
    );

    // Clear validation error for this field
    setValidationErrors((prev) => ({
      ...prev,
      [gatewayId]: {
        ...prev[gatewayId],
        [keyType]: "",
      },
    }));
  };

  const updateBankAccount = (
    gatewayId: string,
    field: string,
    value: string,
  ) => {
    setPaymentGateways((prev) =>
      prev.map((gateway) =>
        gateway.id === gatewayId
          ? {
              ...gateway,
              bankAccount: {
                ...gateway.bankAccount!,
                [field]: value,
              },
            }
          : gateway,
      ),
    );

    // Clear validation error for this field
    setValidationErrors((prev) => ({
      ...prev,
      [gatewayId]: {
        ...prev[gatewayId],
        [field]: "",
      },
    }));
  };

  const toggleGateway = (gatewayId: string, enabled: boolean) => {
    setPaymentGateways((prev) =>
      prev.map((gateway) =>
        gateway.id === gatewayId ? { ...gateway, enabled } : gateway,
      ),
    );
  };

  const toggleTestMode = (gatewayId: string) => {
    setPaymentGateways((prev) =>
      prev.map((gateway) =>
        gateway.id === gatewayId
          ? { ...gateway, testMode: !gateway.testMode }
          : gateway,
      ),
    );
  };

  const setAsDefault = (gatewayId: string) => {
    setPaymentSettings((prev) => ({ ...prev, defaultGateway: gatewayId }));
  };

  const testGatewayConnection = async (gatewayId: string) => {
    const gateway = paymentGateways.find((g) => g.id === gatewayId);
    if (!gateway) return;

    // Validate gateway before testing
    if (!validateGateway(gateway)) {
      toast.error("Please fix validation errors before testing connection");
      return;
    }

    // For manual gateways like Bank Transfer, just update status
    if (gatewayId === "bank_transfer") {
      setPaymentGateways((prev) =>
        prev.map((g) => (g.id === gatewayId ? { ...g, status: "active" } : g)),
      );
      toast.success(`${gateway.name} is ready for manual payment processing!`);
      return;
    }

    try {
      const response = await fetch(
        "/api/admin/payment-settings/test-connection",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gatewayId,
            apiKeys: gateway.apiKeys,
            testMode: gateway.testMode,
          }),
        },
      );

      if (response.ok) {
        toast.success(`${gateway.name} connection test successful!`);
        // Update gateway status
        setPaymentGateways((prev) =>
          prev.map((g) =>
            g.id === gatewayId ? { ...g, status: "active" } : g,
          ),
        );
      } else {
        const error = await response.json();
        toast.error(`${gateway.name} connection test failed: ${error.message}`);
        setPaymentGateways((prev) =>
          prev.map((g) => (g.id === gatewayId ? { ...g, status: "error" } : g)),
        );
      }
    } catch (error) {
      console.error("Error testing gateway connection:", error);
      toast.error(`Failed to test ${gateway.name} connection`);
      setPaymentGateways((prev) =>
        prev.map((g) => (g.id === gatewayId ? { ...g, status: "error" } : g)),
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "testing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "ri-check-line";
      case "inactive":
        return "ri-close-line";
      case "error":
        return "ri-error-warning-line";
      case "testing":
        return "ri-loader-4-line";
      default:
        return "ri-close-line";
    }
  };

  const renderGatewayCard = (gateway: PaymentGateway) => (
    <div
      key={gateway.id}
      className="bg-white border border-gray-200 rounded-lg p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <i className={`${gateway.icon} text-2xl text-blue-600`}></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {gateway.name}
            </h3>
            <p className="text-sm text-gray-600">{gateway.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(gateway.status)}`}
          >
            <i className={`${getStatusIcon(gateway.status)} mr-1`}></i>
            {gateway.status}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={gateway.enabled}
              onChange={(e) => toggleGateway(gateway.id, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Supported Currencies
          </h4>
          <div className="flex flex-wrap gap-1">
            {gateway.supportedCurrencies.map((currency) => (
              <span
                key={currency}
                className="px-2 py-1 bg-gray-100 text-xs rounded"
              >
                {currency}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Features</h4>
          <div className="flex flex-wrap gap-1">
            {gateway.features.map((feature) => (
              <span
                key={feature}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-700">Test Mode</h4>
            <p className="text-xs text-gray-500">
              Use test API keys for development
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={gateway.testMode}
              onChange={() => toggleTestMode(gateway.id)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="space-y-3">
          {/* Only show API keys for card-based payment gateways */}
          {gateway.id !== "bank_transfer" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Public Key {gateway.testMode && "(Test)"} *
                </label>
                <div className="relative">
                  <input
                    type={
                      showApiKeys[`${gateway.id}_public`] ? "text" : "password"
                    }
                    value={gateway.apiKeys.publicKey}
                    onChange={(e) =>
                      updateApiKey(gateway.id, "publicKey", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                      validationErrors[gateway.id]?.publicKey
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder={`${gateway.name} Public Key`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowApiKeys((prev) => ({
                        ...prev,
                        [`${gateway.id}_public`]: !prev[`${gateway.id}_public`],
                      }))
                    }
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                  >
                    <i
                      className={
                        showApiKeys[`${gateway.id}_public`]
                          ? "ri-eye-off-line"
                          : "ri-eye-line"
                      }
                    ></i>
                  </button>
                </div>
                {validationErrors[gateway.id]?.publicKey && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <i className="ri-error-warning-line mr-1"></i>
                    {validationErrors[gateway.id].publicKey}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secret Key {gateway.testMode && "(Test)"} *
                </label>
                <div className="relative">
                  <input
                    type={
                      showApiKeys[`${gateway.id}_secret`] ? "text" : "password"
                    }
                    value={gateway.apiKeys.secretKey}
                    onChange={(e) =>
                      updateApiKey(gateway.id, "secretKey", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                      validationErrors[gateway.id]?.secretKey
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder={`${gateway.name} Secret Key`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowApiKeys((prev) => ({
                        ...prev,
                        [`${gateway.id}_secret`]: !prev[`${gateway.id}_secret`],
                      }))
                    }
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                  >
                    <i
                      className={
                        showApiKeys[`${gateway.id}_secret`]
                          ? "ri-eye-off-line"
                          : "ri-eye-line"
                      }
                    ></i>
                  </button>
                </div>
                {validationErrors[gateway.id]?.secretKey && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <i className="ri-error-warning-line mr-1"></i>
                    {validationErrors[gateway.id].secretKey}
                  </p>
                )}
              </div>

              {/* Flutterwave Hash Field - Only one instance */}
              {gateway.id === "flutterwave" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hash Key {gateway.testMode && "(Test)"} *
                    <span className="text-xs text-gray-500 ml-1">
                      (Required for webhook verification)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={
                        showApiKeys[`${gateway.id}_hash`] ? "text" : "password"
                      }
                      value={gateway.apiKeys.hash || ""}
                      onChange={(e) =>
                        updateApiKey(gateway.id, "hash", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                        validationErrors[gateway.id]?.hash
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Flutterwave Hash Key"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowApiKeys((prev) => ({
                          ...prev,
                          [`${gateway.id}_hash`]: !prev[`${gateway.id}_hash`],
                        }))
                      }
                      className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                    >
                      <i
                        className={
                          showApiKeys[`${gateway.id}_hash`]
                            ? "ri-eye-off-line"
                            : "ri-eye-line"
                        }
                      ></i>
                    </button>
                  </div>
                  {validationErrors[gateway.id]?.hash && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="ri-error-warning-line mr-1"></i>
                      {validationErrors[gateway.id].hash}
                    </p>
                  )}
                </div>
              )}

              {/* Webhook Secret for Flutterwave */}
              {gateway.id === "flutterwave" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook Secret {gateway.testMode && "(Test)"}
                    <span className="text-gray-500 text-xs ml-1">
                      (Optional)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={
                        showApiKeys[`${gateway.id}_webhook`]
                          ? "text"
                          : "password"
                      }
                      value={gateway.apiKeys.webhookSecret || ""}
                      onChange={(e) =>
                        updateApiKey(
                          gateway.id,
                          "webhookSecret",
                          e.target.value,
                        )
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                        validationErrors[gateway.id]?.webhookSecret
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Webhook Secret (Optional)"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowApiKeys((prev) => ({
                          ...prev,
                          [`${gateway.id}_webhook`]:
                            !prev[`${gateway.id}_webhook`],
                        }))
                      }
                      className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                    >
                      <i
                        className={
                          showApiKeys[`${gateway.id}_webhook`]
                            ? "ri-eye-off-line"
                            : "ri-eye-line"
                        }
                      ></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Show manual gateway configuration for Bank Transfer */}
          {gateway.id === "bank_transfer" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3 mb-4">
                <i className="ri-information-line text-blue-600 text-lg mt-0.5"></i>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Manual Payment Gateway
                  </h4>
                  <p className="text-sm text-blue-700">
                    Bank Transfer is a manual payment gateway that doesn't
                    require API keys. Customers will upload proof of payment for
                    manual verification by administrators.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={gateway.bankAccount?.bankName || ""}
                    onChange={(e) =>
                      updateBankAccount(gateway.id, "bankName", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors[gateway.id]?.bankName
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter Bank Name"
                  />
                  {validationErrors[gateway.id]?.bankName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="ri-error-warning-line mr-1"></i>
                      {validationErrors[gateway.id].bankName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={gateway.bankAccount?.accountNumber || ""}
                    onChange={(e) =>
                      updateBankAccount(
                        gateway.id,
                        "accountNumber",
                        e.target.value,
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors[gateway.id]?.accountNumber
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter Account Number"
                  />
                  {validationErrors[gateway.id]?.accountNumber && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="ri-error-warning-line mr-1"></i>
                      {validationErrors[gateway.id].accountNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    value={gateway.bankAccount?.accountName || ""}
                    onChange={(e) =>
                      updateBankAccount(
                        gateway.id,
                        "accountName",
                        e.target.value,
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors[gateway.id]?.accountName
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter Account Name"
                  />
                  {validationErrors[gateway.id]?.accountName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="ri-error-warning-line mr-1"></i>
                      {validationErrors[gateway.id].accountName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Instructions
                  </label>
                  <textarea
                    value={gateway.bankAccount?.instructions || ""}
                    onChange={(e) =>
                      updateBankAccount(
                        gateway.id,
                        "instructions",
                        e.target.value,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Instructions for customers making bank transfers"
                  />
                  <div className="mt-1 text-xs text-gray-500 flex items-start">
                    <i className="ri-information-line mr-1 mt-0.5"></i>
                    <span>
                      These instructions will appear on the checkout page for
                      Bank Transfer payments.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {paymentSettings.defaultGateway === gateway.id && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                <i className="ri-star-fill mr-1"></i>
                Default
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => testGatewayConnection(gateway.id)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center"
            >
              <i className="ri-wifi-line mr-1"></i>
              Test Connection
            </button>
            <button
              onClick={() => setAsDefault(gateway.id)}
              disabled={paymentSettings.defaultGateway === gateway.id}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <i className="ri-star-line mr-1"></i>
              Set Default
            </button>
            <button
              onClick={() => saveGateway(gateway)}
              disabled={savingGateway === gateway.id}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {savingGateway === gateway.id ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-1"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="ri-save-line mr-1"></i>
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Gateway Management
          </h3>
          <p className="text-sm text-gray-600">
            Configure payment gateways and processing settings
          </p>
        </div>
      </div>

      {/* Payment Settings Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Payment Configuration
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Gateway
            </label>
            <select
              value={paymentSettings.defaultGateway}
              onChange={(e) =>
                setPaymentSettings((prev) => ({
                  ...prev,
                  defaultGateway: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {paymentGateways
                .filter((g) => g.enabled)
                .map((gateway) => (
                  <option key={gateway.id} value={gateway.id}>
                    {gateway.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={paymentSettings.currency}
              onChange={(e) =>
                setPaymentSettings((prev) => ({
                  ...prev,
                  currency: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NGN">Nigerian Naira (NGN)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={paymentSettings.taxRate}
              onChange={(e) =>
                setPaymentSettings((prev) => ({
                  ...prev,
                  taxRate: parseFloat(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="7.5"
            />
          </div>
        </div>
      </div>

      {/* Payment Gateways */}
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Payment Gateways
          </h4>
          <div className="space-y-6">
            {paymentGateways.map(renderGatewayCard)}
          </div>
        </div>
      </div>
    </div>
  );
}
