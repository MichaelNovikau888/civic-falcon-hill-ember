import * as Dialog from "@radix-ui/react-dialog";
import { Check, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { currencyLabel, POPULAR, type Lang, messages } from "@/lib/fx/i18n";
import { cn } from "@/lib/utils";

export function CurrencyDialog({
  open,
  lang,
  codes,
  selected,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  lang: Lang;
  codes: string[];
  selected: string;
  onOpenChange: (open: boolean) => void;
  onSelect: (code: string) => void;
}) {
  const copy = messages(lang);
  const searchId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setCursor(0);
  }, [open]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const named = codes.map((code) => ({
      code,
      name: currencyLabel(code, lang),
    }));
    if (!needle) return named;
    return named.filter(
      (item) =>
        item.code.toLowerCase().includes(needle) || item.name.toLowerCase().includes(needle),
    );
  }, [codes, lang, query]);

  const popular = useMemo(() => {
    if (query.trim()) return [];
    const have = new Set(codes);
    return POPULAR.filter((code) => have.has(code));
  }, [codes, query]);

  const flat = query.trim()
    ? filtered
    : [
        ...popular.map((code) => ({ code, name: currencyLabel(code, lang) })),
        ...filtered.filter((item) => !popular.includes(item.code as (typeof POPULAR)[number])),
      ];

  useEffect(() => {
    setCursor(0);
  }, [query]);

  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLButtonElement>(`[data-index="${cursor}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [cursor, open]);

  function choose(code: string) {
    onSelect(code);
    onOpenChange(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((value) => Math.min(flat.length - 1, value + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((value) => Math.max(0, value - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = flat[cursor];
      if (item) choose(item.code);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <div className="flex h-96 max-h-full w-full max-w-md min-h-0 flex-col overflow-hidden rounded-sheet bg-sheet text-ink">
            <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
              <Dialog.Title className="font-display text-2xl leading-none">{copy.pick}</Dialog.Title>
              <Dialog.Description className="sr-only">{copy.searchLabel}</Dialog.Description>
              <Dialog.Close
                className="inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                aria-label={copy.close}
              >
                <X className="size-4" />
              </Dialog.Close>
            </div>
            <div className="border-b border-line px-4 py-3">
              <label className="flex h-11 items-center gap-2 rounded-full border border-line px-3 focus-within:border-ink">
                <Search className="size-4 text-muted" aria-hidden="true" />
                <span className="sr-only" id={searchId}>
                  {copy.searchLabel}
                </span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={copy.search}
                  aria-labelledby={searchId}
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
            </div>
            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto py-1" role="listbox">
              {flat.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted">{copy.empty}</p>
              ) : (
                flat.map((item, index) => {
                  const showHeading =
                    !query.trim() &&
                    (index === 0 ||
                      (index === popular.length && popular.length > 0 && popular.length < flat.length));
                  const heading =
                    index === 0 && popular.length > 0 && !query.trim()
                      ? copy.popularSection
                      : index === popular.length
                        ? copy.all
                        : null;
                  return (
                    <div key={`${item.code}-${index}`}>
                      {showHeading && heading ? (
                        <p className="px-4 pt-3 pb-1 text-xs tracking-widest text-muted uppercase">
                          {heading}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        role="option"
                        data-index={index}
                        aria-selected={item.code === selected}
                        className={cn(
                          "flex h-12 w-full items-center gap-3 px-4 text-left",
                          cursor === index ? "bg-ink/5" : "bg-transparent",
                        )}
                        onMouseEnter={() => setCursor(index)}
                        onClick={() => choose(item.code)}
                      >
                        <span className="w-12 shrink-0 font-semibold tabular-nums">{item.code}</span>
                        <span className="truncate text-sm text-muted">{item.name}</span>
                        {item.code === selected ? (
                          <Check className="ml-auto size-4 shrink-0 text-pine" aria-hidden="true" />
                        ) : null}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
