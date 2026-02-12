import { useAuth } from "@/contexts/AuthContext";
import { normalPlans, agentPlans, formatUGX, SubscriptionPlan } from "@/data/subscriptions";
import { Check, Crown, Zap, X, ShieldCheck, UserCheck } from "lucide-react";
import { useState, useEffect } from "react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: "normal" | "agent";
}

const SubscriptionModal = ({ isOpen, onClose, defaultPlan }: SubscriptionModalProps) => {
  const { subscription, subscribe } = useAuth();
  const [selectedTab, setSelectedTab] = useState<"normal" | "agent">("normal");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [step, setStep] = useState<"plans" | "payment">("plans");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (defaultPlan) {
      setSelectedTab(defaultPlan);
    }
  }, [defaultPlan, isOpen]);

  if (!isOpen) return null;

  const plans = selectedTab === "normal" ? normalPlans : agentPlans;

  const handleStartPayment = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setStep("payment");
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !phoneNumber) return;
    
    setLoading(true);
    setPaymentError("");
    
    try {
      // 1. Format phone number (ensure +256 prefix)
      let msisdn = phoneNumber.trim();
      if (msisdn.startsWith("0")) {
        msisdn = "+256" + msisdn.substring(1);
      } else if (!msisdn.startsWith("+")) {
        msisdn = "+" + msisdn;
      }

      // 2. Validate phone number
      const validateRes = await fetch("https://api.livrauganda.workers.dev/api/validate-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msisdn })
      });
      const validateData = await validateRes.json();
      if (!validateData.success) {
        throw new Error(validateData.message || "Invalid phone number");
      }

      // 3. Initiate deposit
      const depositRes = await fetch("https://api.livrauganda.workers.dev/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          msisdn,
          amount: selectedPlan.price,
          description: `Subscription: ${selectedPlan.label} ${selectedPlan.plan}`
        })
      });
      const depositData = await depositRes.json();
      
      if (!depositData.success || !depositData.internal_reference) {
        throw new Error(depositData.message || "Payment initiation failed");
      }

      const internalReference = depositData.internal_reference;

      // 4. Poll for status
      let attempts = 0;
      const maxAttempts = 30; // 1 minute with 2s interval
      
      const pollStatus = async (): Promise<boolean> => {
        if (attempts >= maxAttempts) return false;
        attempts++;
        
        try {
          const statusRes = await fetch(`https://api.livrauganda.workers.dev/api/request-status?internal_reference=${internalReference}`);
          const statusData = await statusRes.json();
          
          if (statusData.success && statusData.request_status === "success") {
            return true;
          }
          
          if (statusData.request_status === "failed") {
            throw new Error(statusData.message || "Payment failed");
          }
          
          // Wait and try again
          await new Promise(resolve => setTimeout(resolve, 2000));
          return pollStatus();
        } catch (err: any) {
          throw err;
        }
      };

      const isSuccess = await pollStatus();
      
      if (isSuccess) {
        await subscribe(selectedPlan.plan, selectedPlan.duration);
        onClose();
        setStep("plans");
        setSelectedPlan(null);
        setPhoneNumber("");
      } else {
        throw new Error("Payment timeout. Please check your phone.");
      }
    } catch (err: any) {
      setPaymentError(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-card sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              {step === "plans" ? "Choose Your Plan" : "Mobile Money Payment"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === "plans" ? (
            <>
              {/* Tabs */}
              <div className="flex p-1 bg-secondary rounded-xl mb-8 w-fit mx-auto">
                <button
                  onClick={() => setSelectedTab("normal")}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTab === "normal"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Normal Plans
                </button>
                <button
                  onClick={() => setSelectedTab("agent")}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedTab === "agent"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  Agent Plans
                </button>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const isBalanced = plan.label === "Balanced";
                  const isSquare = plan.label === "Square";
                  const isClassic = plan.label === "Classic";
                  const isAgent = plan.plan === "agent";
                  
                  return (
                    <div
                      key={plan.id}
                      className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                        selectedPlan?.id === plan.id
                          ? "border-primary bg-primary/5 scale-105 shadow-xl shadow-primary/10"
                          : isAgent 
                            ? "border-amber-400/30 bg-amber-400/5 hover:border-amber-400/50" 
                            : "border-border hover:border-primary/30"
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      {(isBalanced || isAgent) && (
                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${isAgent ? 'bg-amber-500' : 'gradient-primary'}`}>
                          {isAgent ? 'Professional' : 'Popular'}
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          {isClassic && <Zap className="w-5 h-5 text-blue-500" />}
                          {isSquare && <ShieldCheck className="w-5 h-5 text-purple-500" />}
                          {isBalanced && <Crown className="w-5 h-5 text-primary" />}
                          {isAgent && <UserCheck className="w-5 h-5 text-amber-500" />}
                          <h3 className="text-lg font-bold text-foreground">{plan.label}</h3>
                        </div>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-foreground">
                            {formatUGX(plan.price)}
                          </span>
                          <span className="text-xs text-muted-foreground">/{plan.duration.replace("1", "")}</span>
                        </div>
                      </div>
                      
                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span className="leading-tight">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartPayment(plan);
                        }}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                          selectedPlan?.id === plan.id 
                            ? "gradient-primary text-white shadow-lg shadow-primary/20" 
                            : "bg-secondary text-foreground hover:bg-primary hover:text-white"
                        }`}
                      >
                        Subscribe
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="max-w-md mx-auto py-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Complete Payment</h3>
                <p className="text-muted-foreground">
                  You are subscribing to <span className="text-foreground font-semibold">{selectedPlan?.label} {selectedPlan?.plan.toUpperCase()}</span> for <span className="text-foreground font-semibold">{formatUGX(selectedPlan?.price || 0)}</span>
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mobile Money Number (MTN/Airtel)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 0770000000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
                  />
                </div>

                {paymentError && (
                  <p className="text-sm text-destructive text-center">{paymentError}</p>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep("plans")}
                    className="flex-1 h-12 rounded-xl bg-secondary text-foreground font-semibold hover:bg-secondary/80 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubscribe}
                    disabled={loading || !phoneNumber}
                    className="flex-2 h-12 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 px-8"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Pay Now"
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  By clicking Pay Now, you will receive a prompt on your phone to authorize the transaction.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
