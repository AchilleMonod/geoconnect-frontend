import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Loader2, MapPin, Search } from 'lucide-react';
import { searchAddressSuggestions } from '../../api/addressAutocomplete';
import { AddressSuggestionDTO } from '../../types';
import { cn } from '../../lib/utils';

interface AddressAutocompleteFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onSelect: (suggestion: AddressSuggestionDTO) => void;
  onInputChange?: () => void;
}

export function AddressAutocompleteField({
  id,
  label,
  placeholder = 'Rechercher une adresse officielle',
  disabled = false,
  className,
  onSelect,
  onInputChange,
}: Readonly<AddressAutocompleteFieldProps>) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});
  const selectedLabelRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const generatedId = useId();
  const listboxId = `${id}-suggestions-${generatedId.replaceAll(':', '')}`;

  const updateDropdownPosition = () => {
    const input = containerRef.current?.querySelector('input');
    if (!input) return;

    const rect = input.getBoundingClientRect();
    const viewportPadding = 8;
    const gap = 4;
    const preferredHeight = 288;
    const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding;
    const spaceAbove = rect.top - gap - viewportPadding;
    const openAbove = spaceBelow < 160 && spaceAbove > spaceBelow;
    const availableHeight = Math.max(96, Math.min(preferredHeight, openAbove ? spaceAbove : spaceBelow));

    setDropdownStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      maxHeight: availableHeight,
      zIndex: 1000,
      ...(openAbove
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    });
  };

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 3 || selectedLabelRef.current === normalizedQuery) {
      setSuggestions([]);
      setIsLoading(false);
      setIsOpen(false);
      setHasSearched(false);
      setHasError(false);
      setActiveIndex(-1);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    setSuggestions([]);
    setIsOpen(false);
    setHasSearched(false);
    setHasError(false);
    setActiveIndex(-1);
    const timeoutId = globalThis.setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchAddressSuggestions(normalizedQuery, 8, controller.signal);
        if (!cancelled) {
          setSuggestions(results);
          setHasSearched(true);
          setIsOpen(true);
          setHasError(false);
        }
      } catch {
        if (!cancelled && !controller.signal.aborted) {
          setSuggestions([]);
          setHasSearched(true);
          setIsOpen(true);
          setHasError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      controller.abort();
      globalThis.clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    updateDropdownPosition();
    const handleViewportChange = () => updateDropdownPosition();
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !listRef.current?.contains(target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  const handleSelect = (suggestion: AddressSuggestionDTO) => {
    selectedLabelRef.current = suggestion.label;
    setQuery(suggestion.label);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    onSelect(suggestion);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (suggestions.length === 0 || !['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;

    if (event.key === 'Enter') {
      if (activeIndex >= 0) {
        event.preventDefault();
        handleSelect(suggestions[activeIndex]);
      }
      return;
    }

    event.preventDefault();
    setIsOpen(true);
    setActiveIndex(current => {
      if (event.key === 'ArrowDown') return current >= suggestions.length - 1 ? 0 : current + 1;
      return current <= 0 ? suggestions.length - 1 : current - 1;
    });
  };

  const showDropdown = isOpen && (suggestions.length > 0 || hasSearched);
  const dropdown = showDropdown ? (
    <ul
      ref={listRef}
      id={listboxId}
      role="listbox"
      aria-label={`Suggestions pour ${label}`}
      style={dropdownStyle}
      className="overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg"
    >
      {hasError && <li role="status" aria-live="polite" className="px-3 py-3 text-sm text-red-700">Le service de recherche d’adresses est temporairement indisponible.</li>}
      {!hasError && hasSearched && suggestions.length === 0 && (
        <li role="status" aria-live="polite" className="px-3 py-3 text-sm text-slate-500">Aucune adresse trouvée.</li>
      )}
      {!hasError && suggestions.map((suggestion, index) => (
        <li
          id={`${listboxId}-option-${index}`}
          key={`${suggestion.label}-${index}`}
          role="option"
          aria-selected={activeIndex === index}
        >
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => handleSelect(suggestion)}
            className={cn(
              'flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm hover:bg-blue-50 focus:outline-none',
              activeIndex === index && 'bg-blue-50',
            )}
          >
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-slate-900">{suggestion.label}</span>
              {(suggestion.codePostal || suggestion.ville) && (
                <span className="block truncate text-xs text-slate-500">
                  {[suggestion.codePostal, suggestion.ville].filter(Boolean).join(' ')}
                </span>
              )}
            </span>
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  ) : null;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <label htmlFor={id} className="block text-[11px] font-semibold text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          id={id}
          type="text"
          value={query}
          disabled={disabled}
          onChange={(event) => {
            selectedLabelRef.current = null;
            onInputChange?.();
            setQuery(event.target.value);
          }}
          onFocus={() => setIsOpen(suggestions.length > 0)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="flex h-10 w-full rounded border border-slate-300 bg-white pl-9 pr-10 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 disabled:cursor-not-allowed disabled:bg-slate-50"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showDropdown}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          role="combobox"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" aria-hidden="true" />
        )}
      </div>

      {dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}
