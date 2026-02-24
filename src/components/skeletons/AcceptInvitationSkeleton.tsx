import React from "react";

/**
 * AcceptInvitationSkeleton - Server-rendered skeleton placeholder for the Accept Invitation page.
 * Matches the exact layout dimensions: max-w-md centered card with title and button.
 * Uses CSS-only animate-pulse for the loading effect.
 */
export default function AcceptInvitationSkeleton() {
  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow animate-pulse">
      {/* Title */}
      <div className="h-7 w-48 bg-gray-200 rounded mb-4" />
      {/* Description text */}
      <div className="h-5 w-64 bg-gray-100 rounded mb-4" />
      {/* Button */}
      <div className="h-10 w-40 bg-gray-200 rounded" />
    </div>
  );
}
