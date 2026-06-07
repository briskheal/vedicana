"use client";
import React, { useState, useEffect } from 'react';

export default function SafeHtmlRenderer({ html }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial hydration, render an empty div to prevent 
  // browser parsing/hydration mismatches from malformed legacy HTML tags.
  if (!mounted) {
    return <div className="discover-content" dangerouslySetInnerHTML={{ __html: '' }} />;
  }

  return (
    <div 
      className="discover-content"
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
}
