'use client'

import React, { createContext, useCallback, useContext, useState } from "react";
import { FileKind } from "../services/api";

const ChecksContext = createContext(null);

export const ChecksProvider = ({ children }) => {
  const [fileMap, setFileMap] = useState({
    [FileKind.STAFF_PLANNING]: null,
    [FileKind.CHILD_PLANNING]: null,
    [FileKind.CHILD_REGISTRATION]: null,
    [FileKind.VGC_LIST]: null,
  });

  const handleRemoved = useCallback(function handleRemoved(kind) {
    setFileMap((prev) => ({
      ...prev,
      [kind]: null,
    }));
  }, []);

  const handleAdded = useCallback(function handleAdded(kind, item) {
    setFileMap((prev) => ({
      ...prev,
      [kind]: item,
    }));
  });

  return (
    <ChecksContext.Provider
      value={{ fileMap, onRemoved: handleRemoved, onAdded: handleAdded }}
    >
      {children}
    </ChecksContext.Provider>
  );
};

export const useChecks = () => {
  const context = useContext(ChecksContext);
  if (!context) {
    throw new Error("useChecks must be used within a ChecksProvider");
  }
  return context;
};

export default ChecksContext;
