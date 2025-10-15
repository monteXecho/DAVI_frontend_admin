import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { toLocaleDateString } from "../../helpers/date";
import { copyClipboard } from "../../helpers/clipboard";

export default function CustomizedSelect({
  options,
  value,
  onChange,
  placeholder = "Select an item…",
  disabled = false,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  const updatedOptions = useMemo(
    () =>
      options.map(({ date, ...rest }) => ({
        ...rest,
        date: date.map((item) => toLocaleDateString(item)),
      })),
    [options]
  );

  const filtered = useMemo(() => {
    if (!query) return updatedOptions;
    const q = query.toLowerCase();
    return updatedOptions.filter((o) =>
      JSON.stringify([o.check_id, o.date, o.modules, o.group])
        .toLowerCase()
        .includes(q)
    );
  }, [query, updatedOptions]);

  const selected = useMemo(
    () => updatedOptions.find((o) => o.check_id === value) || null,
    [updatedOptions, value]
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
          "hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="block truncate font-medium text-gray-900">
            {selected ? (
              <>
                {selected.date && selected.date.length > 0 && (
                  <span className="">
                    {selected.date[0]}
                    {selected.date.length !== 1 &&
                      `~${selected.date[selected.date.length - 1]}`}
                  </span>
                )}
              </>
            ) : (
              placeholder
            )}
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
              Zoekopdracht
            </label>
            <input
              id="tls-search"
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              placeholder="Zoekopdracht..."
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <ul className="max-h-72 overflow-auto py-1" tabIndex={-1}>
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-gray-500">Geen resultaten</li>
            )}
            {filtered.map((o, idx) => (
              <li
                id={`option-${o.check_id}`}
                key={o.check_id}
                role="option"
                aria-selected={value === o.check_id}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={() => {
                  onChange?.(o.check_id);
                  setOpen(false);
                  setQuery("");
                  setActiveIndex(-1);
                  buttonRef.current?.focus();
                }}
                className={clsx(
                  "group cursor-pointer px-3 py-2 transition-colors",
                  idx === activeIndex ? "bg-green-50" : ""
                )}
              >
                <div
                  className={clsx("truncate font-medium text-gray-700", {
                    "!text-gray-900": value === o.check_id,
                  })}
                >
                  {o.date && o.date.length > 0 && (
                    <span className="">
                      {o.date[0]}
                      {o.date.length !== 1 && `~${o.date[o.date.length - 1]}`}
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span
                    className="truncate text-gray-500 text-xs hover:rounded hover:bg-green-200 transition-all"
                    title="Klik om de cheque-ID te kopiëren"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      copyClipboard(o.check_id);
                    }}
                  >
                    <i>check id</i>: {o.check_id.substring(0, 8)}...
                    {o.check_id.substring(o.check_id.length - 8)}
                  </span>
                  <span className="truncate text-gray-500 text-xs">
                    {o.modules.join(", ").toUpperCase()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
