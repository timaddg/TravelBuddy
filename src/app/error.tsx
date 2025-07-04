"use client";
import React from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: 32 }}>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()} style={{ margin: '16px 0', padding: '8px 16px' }}>Try again</button>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  );
} 