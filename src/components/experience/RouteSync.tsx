"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { experienceStore } from "@/lib/experience-store";
import { parseRoute } from "@/lib/sections";

/**
 * Two-way bridge between the URL and the projector state machine.
 *  - URL → store: back/forward, in-content <Link>s and deep links trigger the
 *    physical slide change.
 *  - store → URL: physical interactions push (slides) or replace (views).
 */
export function RouteSync() {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const lastSeq = useRef(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false; // hydrated synchronously by ProjectorExperience
      return;
    }
    experienceStore.getState().navigate(parseRoute(pathname, params.toString()), "route");
  }, [pathname, params]);

  useEffect(() => {
    return experienceStore.subscribe((s) => {
      const req = s.urlRequest;
      if (!req || req.seq === lastSeq.current) return;
      lastSeq.current = req.seq;
      const here = window.location.pathname + window.location.search;
      if (req.url === here) return;
      if (req.mode === "push") router.push(req.url, { scroll: false });
      else window.history.replaceState(window.history.state, "", req.url);
    });
  }, [router]);

  return null;
}
