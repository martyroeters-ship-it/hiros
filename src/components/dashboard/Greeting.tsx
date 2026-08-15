"use client";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "Good morning, Martijn";
  if (hour >= 12 && hour < 18) return "Good afternoon, Martijn";
  if (hour >= 18 && hour < 24) return "Good evening, Martijn";
  return "Good night, Martijn";
}

export function Greeting() {
  return <>{getGreeting()}</>;
}
