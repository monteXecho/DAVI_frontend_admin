import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

export default function CustomizedSelect({
  options: externalOptions,
  value,
  onChange,
  placeholder = "Select an item…",
  disabled = false,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [options, setOptions] = useState(externalOptions || []);

  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    setOptions(externalOptions || []);
  }, [externalOptions]);

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        (o.description || "").toLowerCase().includes(q)
    );
  }, [query, options]);

  const selected = useMemo(
    () => options.find((o) => o.id === value) || null,
    [options, value]
  );

  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function handleKeyDown(e) {
    if (disabled) return;
    const key = e.key;

    if (!open) {
      if (
        key === "ArrowDown" ||
        key === "ArrowUp" ||
        key === " " ||
        key === "Enter"
      ) {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => {
          listRef.current?.querySelector("input")?.focus();
          setActiveIndex(0);
        }, 0);
      }
      return;
    }

    if (open) {
      if (key === "Escape") {
        e.preventDefault();
        setOpen(false);
        setQuery("");
        setActiveIndex(-1);
        buttonRef.current?.focus();
        return;
      }
      if (key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (key === "Enter") {
        e.preventDefault();
        const item = filtered[activeIndex];
        if (item) {
          onChange?.(item.id);
          setOpen(false);
          setQuery("");
          setActiveIndex(-1);
          buttonRef.current?.focus();
        }
      }
    }
  }

  return (
    <div
      ref={rootRef}
      className={clsx(
        "relative w-full max-w-md text-sm",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        ref={buttonRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
          setTimeout(() => listRef.current?.querySelector("input")?.focus(), 0);
        }}
        className={clsx(
          "w-full inline-flex items-center justify-between rounded-xl border bg-white px-3 py-2 shadow-sm",
          "hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="block truncate font-medium text-gray-900">
            {selected ? selected.title : placeholder}
          </span>
          {selected?.description ? (
            <span className="ml-2 truncate text-gray-500 hidden sm:inline">
              {selected.description}
            </span>
          ) : null}
        </span>
        <svg
          className={clsx("h-5 w-5 text-gray-400 transition-all", {
            "rotate-180": open,
          })}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          aria-activedescendant={
            activeIndex >= 0 ? `option-${filtered[activeIndex]?.id}` : undefined
          }
          className={clsx(
            "absolute z-50 mt-2 w-full overflow-hidden rounded-xl border bg-white shadow-xl transition-all"
          )}
        >
          <div className="p-2 border-b bg-gray-50">
            <label className="sr-only" htmlFor="tls-search">
              Search
            </label>
            <input
              id="tls-search"
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              placeholder="Search…"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <ul className="max-h-72 overflow-auto py-1" tabIndex={-1}>
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-gray-500">No results</li>
            )}
            {filtered.map((o, idx) => (
              <li
                id={`option-${o.id}`}
                key={o.id}
                role="option"
                aria-selected={value === o.id}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={() => {
                  onChange?.(o.id);
                  setOpen(false);
                  setQuery("");
                  setActiveIndex(-1);
                  buttonRef.current?.focus();
                }}
                className={clsx(
                  "group cursor-pointer px-3 py-2 transition-colors",
                  idx === activeIndex ? "bg-indigo-50" : ""
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-gray-900">
                      {o.title}
                    </div>
                    {o.description ? (
                      <div className="truncate text-gray-500 text-xs">
                        {o.description}
                      </div>
                    ) : null}
                  </div>
                  {value === o.id && (
                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="inline-flex items-center rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                        Selected
                      </span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Demo() {
  const [value, setValue] = useState("2");
  const [options, setOptions] = useState([
    { id: "1", title: "Paris", description: "City of Light" },
    { id: "2", title: "Tokyo", description: "Vibrant tech & culture" },
    { id: "3", title: "São Paulo", description: "Brazilian megacity" },
    { id: "4", title: "Kyiv", description: "Historic capital" },
    { id: "5", title: "Toronto", description: "CN Tower views" },
  ]);

  return (
    <div className="min-h-[60vh] w-full bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="mx-auto max-w-md">
        <h1 className="mb-3 text-xl font-semibold tracking-tight">
          Two‑Line Editable Select
        </h1>
        <p className="mb-4 text-sm text-gray-600">
          Search in the dropdown, edit an option in place, and select.
        </p>
        <CustomizedSelect
          options={options}
          value={value}
          onChange={setValue}
        />

        <div className="mt-6 rounded-xl border bg-white p-4 text-sm shadow-sm">
          <div className="mb-2 font-medium">Selected value</div>
          <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3">
            {JSON.stringify({ value }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
