// Supabase database utilities for referral program
// Handles referrers, referrals, and payments

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase credentials not configured. Referral features will use in-memory fallback."
  );
}

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// In-memory fallback storage (for development/testing)
const memoryStorage = {
  referrers: [],
  referrals: [],
  payments: [],
};

// ==================== REFERRERS ====================
export async function getReferrers() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("referrers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get referrers from Supabase:", error);
      return memoryStorage.referrers;
    }
  }
  return memoryStorage.referrers;
}

export async function getReferrerById(id) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("referrers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Failed to get referrer from Supabase:", error);
      return memoryStorage.referrers.find((r) => r.id === id);
    }
  }
  return memoryStorage.referrers.find((r) => r.id === id);
}

export async function getReferrerByEmail(email) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("referrers")
        .select("*")
        .eq("email", email.toLowerCase())
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Supabase error getting referrer by email:", error);
        throw error;
      }

      // Only log in development
      const isDevelopment =
        process.env.VERCEL_ENV !== "production" &&
        process.env.NODE_ENV !== "production";

      if (data && isDevelopment) {
        console.log("Referrer retrieved from Supabase:", {
          id: data.id,
          email: data.email,
          hasPassword: !!data.password,
        });
      }

      return data;
    } catch (error) {
      console.error("Failed to get referrer by email from Supabase:", error);
      return memoryStorage.referrers.find(
        (r) => r.email?.toLowerCase() === email.toLowerCase()
      );
    }
  }
  return memoryStorage.referrers.find(
    (r) => r.email?.toLowerCase() === email.toLowerCase()
  );
}

export async function getReferrerByCode(referralCode) {
  if (!referralCode) {
    console.error("getReferrerByCode called with empty referralCode");
    return null;
  }

  const normalizedCode = referralCode.toUpperCase().trim();
  console.log("Looking up referrer by code:", {
    original: referralCode,
    normalized: normalizedCode,
  });

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("referrers")
        .select("*")
        .eq("referral_code", normalizedCode)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Not found
          console.error("Referrer not found for code:", normalizedCode);
          return null;
        }
        throw error;
      }

      if (data) {
        console.log("Referrer found by code:", {
          id: data.id,
          email: data.email,
          code: data.referral_code,
        });
      }

      return data;
    } catch (error) {
      console.error("Failed to get referrer by code from Supabase:", error);
      return memoryStorage.referrers.find(
        (r) => r.referral_code?.toUpperCase() === normalizedCode
      );
    }
  }
  return memoryStorage.referrers.find(
    (r) => r.referral_code?.toUpperCase() === normalizedCode
  );
}

export async function createReferrer(referrerData) {
  // Validate required fields
  if (!referrerData.name || !referrerData.email) {
    throw new Error("Name and email are required");
  }

  // Generate unique referral code
  const referralCode = generateReferralCode(
    referrerData.name || referrerData.email
  );

  const newReferrer = {
    name: referrerData.name,
    email: (referrerData.email || "").toLowerCase().trim(),
    phone: referrerData.phone || null,
    address: referrerData.address || null,
    password: referrerData.password || null,
    payment_method: referrerData.payment_method || null,
    payment_details: referrerData.payment_details || null,
    referral_code: referralCode,
    status: "active",
    total_referrals: 0,
    total_earnings: 0,
    paid_earnings: 0,
    pending_earnings: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Log the data being inserted (without sensitive info)
  console.log("Creating referrer with data:", {
    name: newReferrer.name,
    email: newReferrer.email,
    phone: newReferrer.phone ? "***" : null,
    hasPassword: !!newReferrer.password,
    referral_code: newReferrer.referral_code,
  });

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("referrers")
        .insert([newReferrer])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from Supabase insert");
      }

      console.log("Successfully created referrer in Supabase:", {
        id: data.id,
        email: data.email,
        referral_code: data.referral_code,
      });

      return data;
    } catch (error) {
      console.error("Failed to create referrer in Supabase:", error);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error(
        "Error details:",
        error.details || error.hint || "No additional details"
      );

      // Check if it's a production environment (Vercel sets VERCEL_ENV)
      const isProduction =
        process.env.VERCEL_ENV === "production" ||
        process.env.NODE_ENV === "production";

      // Re-throw the error so the API handler can respond appropriately
      // Include more details about what went wrong
      const errorMessage = error.message || "Unknown database error";
      const errorDetails = error.details || error.hint || "";
      throw new Error(
        `Failed to save to database: ${errorMessage}${
          errorDetails ? ` (${errorDetails})` : ""
        }`
      );
    }
  }

  // Supabase not configured
  console.warn("Supabase not configured. Using in-memory storage.");
  console.warn(
    "Set SUPABASE_URL and SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY environment variables."
  );

  // Check if it's a production environment (Vercel sets VERCEL_ENV)
  const isProduction =
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";

  if (isProduction) {
    throw new Error(
      "Database not configured. Please configure Supabase credentials."
    );
  }

  newReferrer.id = Date.now().toString();
  memoryStorage.referrers.push(newReferrer);
  return newReferrer;
}

export async function updateReferrer(id, updates) {
  const updatedData = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("referrers")
        .update(updatedData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Failed to update referrer in Supabase:", error);
      const index = memoryStorage.referrers.findIndex((r) => r.id === id);
      if (index !== -1) {
        memoryStorage.referrers[index] = {
          ...memoryStorage.referrers[index],
          ...updatedData,
        };
        return memoryStorage.referrers[index];
      }
      return null;
    }
  }

  const index = memoryStorage.referrers.findIndex((r) => r.id === id);
  if (index !== -1) {
    memoryStorage.referrers[index] = {
      ...memoryStorage.referrers[index],
      ...updatedData,
    };
    return memoryStorage.referrers[index];
  }
  return null;
}

// ==================== REFERRALS ====================
export async function getReferrals(referrerId = null) {
  if (supabase) {
    try {
      let query = supabase.from("referrals").select("*");

      if (referrerId) {
        query = query.eq("referrer_id", referrerId);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get referrals from Supabase:", error);
      let referrals = memoryStorage.referrals;
      if (referrerId) {
        referrals = referrals.filter((r) => r.referrer_id === referrerId);
      }
      return referrals;
    }
  }

  let referrals = memoryStorage.referrals;
  if (referrerId) {
    referrals = referrals.filter((r) => r.referrer_id === referrerId);
  }
  return referrals;
}

export async function createReferral(referralData) {
  console.log("Creating referral with data:", {
    referrer_id: referralData.referrer_id,
    customer_name: referralData.customer_name,
    customer_email: referralData.customer_email,
  });

  const newReferral = {
    ...referralData,
    status: "pending",
    commission_amount: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("referrals")
        .insert([newReferral])
        .select()
        .single();

      if (error) {
        console.error("Supabase error creating referral:", error);
        console.error("Error details:", error.message, error.details);
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from Supabase insert");
      }

      console.log("Referral created successfully:", {
        id: data.id,
        referrer_id: data.referrer_id,
        customer_name: data.customer_name,
      });

      // Update referrer stats
      await updateReferrerStats(referralData.referrer_id);

      return data;
    } catch (error) {
      console.error("Failed to create referral in Supabase:", error);
      newReferral.id = Date.now().toString();
      memoryStorage.referrals.push(newReferral);
      await updateReferrerStats(referralData.referrer_id);
      return newReferral;
    }
  }

  newReferral.id = Date.now().toString();
  memoryStorage.referrals.push(newReferral);
  await updateReferrerStats(referralData.referrer_id);
  return newReferral;
}

export async function updateReferral(id, updates) {
  const updatedData = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("referrals")
        .update(updatedData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update referrer stats if status or commission changed
      if (updates.status || updates.commission_amount) {
        const referral =
          data || memoryStorage.referrals.find((r) => r.id === id);
        if (referral?.referrer_id) {
          await updateReferrerStats(referral.referrer_id);
        }
      }

      return data;
    } catch (error) {
      console.error("Failed to update referral in Supabase:", error);
      const index = memoryStorage.referrals.findIndex((r) => r.id === id);
      if (index !== -1) {
        memoryStorage.referrals[index] = {
          ...memoryStorage.referrals[index],
          ...updatedData,
        };
        const referral = memoryStorage.referrals[index];
        if (referral?.referrer_id) {
          await updateReferrerStats(referral.referrer_id);
        }
        return memoryStorage.referrals[index];
      }
      return null;
    }
  }

  const index = memoryStorage.referrals.findIndex((r) => r.id === id);
  if (index !== -1) {
    memoryStorage.referrals[index] = {
      ...memoryStorage.referrals[index],
      ...updatedData,
    };
    const referral = memoryStorage.referrals[index];
    if (referral?.referrer_id) {
      await updateReferrerStats(referral.referrer_id);
    }
    return memoryStorage.referrals[index];
  }
  return null;
}

// ==================== PAYMENTS ====================
export async function getPayments(referrerId = null) {
  if (supabase) {
    try {
      let query = supabase.from("referral_payments").select("*");

      if (referrerId) {
        query = query.eq("referrer_id", referrerId);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Failed to get payments from Supabase:", error);
      let payments = memoryStorage.payments;
      if (referrerId) {
        payments = payments.filter((p) => p.referrer_id === referrerId);
      }
      return payments;
    }
  }

  let payments = memoryStorage.payments;
  if (referrerId) {
    payments = payments.filter((p) => p.referrer_id === referrerId);
  }
  return payments;
}

export async function createPayment(paymentData) {
  const newPayment = {
    ...paymentData,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("referral_payments")
        .insert([newPayment])
        .select()
        .single();

      if (error) throw error;

      // Update referrer paid earnings
      if (paymentData.status === "completed") {
        await updateReferrerPaidEarnings(
          paymentData.referrer_id,
          paymentData.amount
        );
      }

      return data;
    } catch (error) {
      console.error("Failed to create payment in Supabase:", error);
      newPayment.id = Date.now().toString();
      memoryStorage.payments.push(newPayment);
      if (paymentData.status === "completed") {
        await updateReferrerPaidEarnings(
          paymentData.referrer_id,
          paymentData.amount
        );
      }
      return newPayment;
    }
  }

  newPayment.id = Date.now().toString();
  memoryStorage.payments.push(newPayment);
  if (paymentData.status === "completed") {
    await updateReferrerPaidEarnings(
      paymentData.referrer_id,
      paymentData.amount
    );
  }
  return newPayment;
}

export async function updatePayment(id, updates) {
  const updatedData = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("referral_payments")
        .update(updatedData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update referrer paid earnings if status changed to completed
      if (updates.status === "completed") {
        const payment = data || memoryStorage.payments.find((p) => p.id === id);
        if (payment?.referrer_id) {
          await updateReferrerPaidEarnings(payment.referrer_id, payment.amount);
        }
      }

      return data;
    } catch (error) {
      console.error("Failed to update payment in Supabase:", error);
      const index = memoryStorage.payments.findIndex((p) => p.id === id);
      if (index !== -1) {
        memoryStorage.payments[index] = {
          ...memoryStorage.payments[index],
          ...updatedData,
        };
        const payment = memoryStorage.payments[index];
        if (updates.status === "completed" && payment?.referrer_id) {
          await updateReferrerPaidEarnings(payment.referrer_id, payment.amount);
        }
        return memoryStorage.payments[index];
      }
      return null;
    }
  }

  const index = memoryStorage.payments.findIndex((p) => p.id === id);
  if (index !== -1) {
    memoryStorage.payments[index] = {
      ...memoryStorage.payments[index],
      ...updatedData,
    };
    const payment = memoryStorage.payments[index];
    if (updates.status === "completed" && payment?.referrer_id) {
      await updateReferrerPaidEarnings(payment.referrer_id, payment.amount);
    }
    return memoryStorage.payments[index];
  }
  return null;
}

// ==================== HELPER FUNCTIONS ====================
function generateReferralCode(nameOrEmail) {
  // Generate code like: SUN-JOHN-1234
  const prefix = "SUN";
  let middle =
    nameOrEmail
      ?.substring(0, 4)
      .toUpperCase()
      .replace(/[^A-Z]/g, "") || "REF";
  const suffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `${prefix}-${middle}-${suffix}`;
}

async function updateReferrerStats(referrerId) {
  const referrals = await getReferrals(referrerId);
  const totalReferrals = referrals.length;
  const completedReferrals = referrals.filter((r) => r.status === "completed");
  const totalEarnings = completedReferrals.reduce(
    (sum, r) => sum + (r.commission_amount || 0),
    0
  );
  const pendingEarnings = referrals
    .filter((r) => r.status === "pending" || r.status === "approved")
    .reduce((sum, r) => sum + (r.commission_amount || 0), 0);

  const referrer = await getReferrerById(referrerId);
  const paidEarnings = referrer?.paid_earnings || 0;

  await updateReferrer(referrerId, {
    total_referrals: totalReferrals,
    total_earnings: totalEarnings,
    pending_earnings: pendingEarnings,
  });
}

async function updateReferrerPaidEarnings(referrerId, amount) {
  const referrer = await getReferrerById(referrerId);
  if (referrer) {
    await updateReferrer(referrerId, {
      paid_earnings: (referrer.paid_earnings || 0) + amount,
    });
  }
}
