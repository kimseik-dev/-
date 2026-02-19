"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import styles from "./TopBar.module.css";

function TopBarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );

  // Sync state with URL when parameter changes (e.g. navigation, back button)
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  // Handle search input with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";
      if (currentSearch !== searchTerm) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm) {
          params.set("search", searchTerm);
        } else {
          params.delete("search");
        }
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, pathname, router]); // Exclude searchParams from dep array to avoid loop, we read current val inside

  return (
    <header className={styles.topbar}>
      <div className={styles.actions}>
        {/* Left spacer or breacrumbs could go here */}
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Smart Search"
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <div className={styles.avatar}>KSI</div>
      </div>
    </header>
  );
}

export default function TopBar() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TopBarContent />
    </Suspense>
  );
}
