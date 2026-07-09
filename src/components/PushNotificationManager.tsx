"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      setPermission(Notification.permission);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }

  async function subscribeToPush() {
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      if (permissionResult !== "granted") {
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error("No VAPID public key found in environment variables");
        alert("PWA Setup Incomplete: Missing VAPID Public Key in environment variables.");
        return;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setSubscription(sub);
      
      // Save subscription to Supabase
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from("admin_subscriptions").upsert({
          user_id: user.id,
          endpoint: sub.endpoint,
          keys_auth: sub.toJSON().keys?.auth,
          keys_p256dh: sub.toJSON().keys?.p256dh,
        }, { onConflict: 'endpoint' });
        console.log("Subscription saved to database");
      }
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
    }
  }

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (!isSupported) {
    return null;
  }

  return (
    <div className="bg-white/50 backdrop-blur-md p-6 rounded-2xl border border-black/5 mb-8">
      <h3 className="text-lg font-serif mb-2">Push Notifications</h3>
      {permission === "granted" && subscription ? (
        <p className="text-sm text-gray-500">
          ✅ You are subscribed to receive new order notifications on this device.
        </p>
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Enable notifications to instantly know when a new order arrives.
          </p>
          <button
            onClick={subscribeToPush}
            className="gold-button text-sm px-6 py-2"
          >
            Enable Notifications
          </button>
        </div>
      )}
    </div>
  );
}
