"use client";

import { useEffect } from "react";

export default function DisableCopy() {
  useEffect(() => {
    const block = (e: Event) => e.preventDefault();

    const events = [
      "copy",
      "cut",
      "paste",
      "contextmenu",
      "selectstart",
      "dragstart",
    ];

    events.forEach((event) => document.addEventListener(event, block));

    return () => {
      events.forEach((event) => document.removeEventListener(event, block));
    };
  }, []);

  return null;
}