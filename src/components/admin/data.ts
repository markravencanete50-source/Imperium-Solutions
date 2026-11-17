"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";

type Result<T> = { data: T[]; loading: boolean; error: string };

/**
 * Live list of a Firestore collection (or subcollection path), newest first by default.
 * Pass an empty path to skip the subscription.
 */
export function useCollection<T extends { id: string }>(
  path: string,
  orderField = "createdAt",
  direction: "asc" | "desc" = "desc"
): Result<T> {
  const [state, setState] = useState<Result<T> & { path: string }>({ data: [], loading: true, error: "", path });

  useEffect(() => {
    if (!path) return;
    const q = query(collection(getDb(), path), orderBy(orderField, direction));
    return onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: "estimate" }) }) as T);
        setState({ data, loading: false, error: "", path });
      },
      (err) => setState({ data: [], loading: false, error: err.message, path })
    );
  }, [path, orderField, direction]);

  // Results from a previous path are never shown for the new one.
  if (!path) return { data: [], loading: false, error: "" };
  if (state.path !== path) return { data: [], loading: true, error: "" };
  return state;
}

export function createRecord(path: string, data: DocumentData) {
  return addDoc(collection(getDb(), path), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export function updateRecord(path: string, id: string, data: DocumentData) {
  return updateDoc(doc(getDb(), path, id), { ...data, updatedAt: serverTimestamp() });
}

export function saveRecord(path: string, id: string, data: DocumentData) {
  return setDoc(doc(getDb(), path, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export function removeRecord(path: string, id: string) {
  return deleteDoc(doc(getDb(), path, id));
}

export { serverTimestamp };

/** The time the page was opened. Read once so renders stay pure. */
export function useNow() {
  const [now] = useState(() => Date.now());
  return now;
}
