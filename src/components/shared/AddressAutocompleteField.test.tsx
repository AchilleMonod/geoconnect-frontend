import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddressAutocompleteField } from './AddressAutocompleteField';
import { searchAddressSuggestions } from '../../api/addressAutocomplete';

vi.mock('../../api/addressAutocomplete', () => ({ searchAddressSuggestions: vi.fn() }));

const PARIS = { label: '12 Rue de la Paix 75001 Paris', rue: '12 Rue de la Paix', codePostal: '75001', ville: 'Paris' };
const LYON = { label: '4 Rue Victor Hugo 69002 Lyon', codePostal: '69002', ville: 'Lyon' };

describe('AddressAutocompleteField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(searchAddressSuggestions).mockResolvedValue([PARIS, LYON]);
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
  });

  afterEach(() => vi.useRealTimers());

  it('rend les suggestions dans un portail et sélectionne au clic', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<div className="overflow-hidden"><AddressAutocompleteField id="address" label="Adresse" onSelect={onSelect} /></div>);
    await user.type(screen.getByLabelText('Adresse'), '12 rue paix');

    await waitFor(() => expect(searchAddressSuggestions).toHaveBeenCalledWith('12 rue paix', 8, expect.any(AbortSignal)));
    const listbox = await screen.findByRole('listbox');
    expect(listbox.parentElement).toBe(document.body);
    expect(screen.getByLabelText('Adresse')).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByText(PARIS.label));

    expect(onSelect).toHaveBeenCalledWith(PARIS);
    expect(screen.getByLabelText('Adresse')).toHaveValue(PARIS.label);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('ne recherche pas avant trois caractères et signale la modification', () => {
    const onInputChange = vi.fn();
    render(<AddressAutocompleteField id="address" label="Adresse" onSelect={vi.fn()} onInputChange={onInputChange} />);
    const input = screen.getByLabelText('Adresse');
    fireEvent.change(input, { target: { value: 'pa' } });

    expect(searchAddressSuggestions).not.toHaveBeenCalled();
    expect(onInputChange).toHaveBeenCalledOnce();
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('affiche un état vide après une recherche sans résultat', async () => {
    vi.mocked(searchAddressSuggestions).mockResolvedValueOnce([]);
    render(<AddressAutocompleteField id="address" label="Adresse" onSelect={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Adresse'), { target: { value: 'adresse inconnue' } });
    expect(await screen.findByText('Aucune adresse trouvée.')).toBeVisible();
  });

  it('affiche un message dédié lorsque le service échoue', async () => {
    vi.mocked(searchAddressSuggestions).mockRejectedValueOnce(new Error('503'));
    render(<AddressAutocompleteField id="address" label="Adresse" onSelect={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Adresse'), { target: { value: '15 rue de la' } });
    expect(await screen.findByText(/temporairement indisponible/)).toBeVisible();
  });

  it('annule la requête précédente lorsque la saisie change', async () => {
    let firstSignal: AbortSignal | undefined;
    vi.mocked(searchAddressSuggestions).mockImplementation((_query, _limit, signal) => {
      firstSignal ??= signal;
      return new Promise(() => undefined);
    });
    render(<AddressAutocompleteField id="address" label="Adresse" onSelect={vi.fn()} />);
    const input = screen.getByLabelText('Adresse');
    fireEvent.change(input, { target: { value: 'Paris' } });
    await waitFor(() => expect(searchAddressSuggestions).toHaveBeenCalledOnce());
    fireEvent.change(input, { target: { value: 'Lyon' } });
    expect(firstSignal?.aborted).toBe(true);
  });

  it('ignore le rejet d’une requête déjà annulée', async () => {
    let rejectRequest: ((reason: Error) => void) | undefined;
    vi.mocked(searchAddressSuggestions).mockImplementationOnce(() => new Promise((_resolve, reject) => { rejectRequest = reject; }));
    render(<AddressAutocompleteField id="address" label="Adresse" onSelect={vi.fn()} />);
    const input = screen.getByLabelText('Adresse');
    fireEvent.change(input, { target: { value: 'Paris' } });
    await waitFor(() => expect(searchAddressSuggestions).toHaveBeenCalledOnce());
    fireEvent.change(input, { target: { value: 'pa' } });
    await act(async () => rejectRequest?.(new Error('aborted')));
    expect(screen.queryByText(/temporairement indisponible/)).not.toBeInTheDocument();
  });

  it('ignore aussi le succès tardif d’une requête annulée', async () => {
    let resolveRequest: ((value: typeof PARIS[]) => void) | undefined;
    vi.mocked(searchAddressSuggestions).mockImplementationOnce(() => new Promise(resolve => { resolveRequest = resolve; }));
    render(<AddressAutocompleteField id="address" label="Adresse" onSelect={vi.fn()} />);
    const input = screen.getByLabelText('Adresse');
    fireEvent.change(input, { target: { value: 'Paris' } });
    await waitFor(() => expect(searchAddressSuggestions).toHaveBeenCalledOnce());
    fireEvent.change(input, { target: { value: 'pa' } });
    await act(async () => resolveRequest?.([PARIS]));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('parcourt, boucle et sélectionne les résultats au clavier', async () => {
    const onSelect = vi.fn();
    render(<AddressAutocompleteField id="address" label="Adresse" onSelect={onSelect} />);
    const input = screen.getByLabelText('Adresse');
    fireEvent.change(input, { target: { value: 'rue test' } });
    await screen.findByRole('listbox');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: new RegExp(PARIS.label) })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: new RegExp(LYON.label) })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(screen.getByRole('option', { name: new RegExp(LYON.label) })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(PARIS);
  });

  it('ignore Entrée sans option active et les autres touches', async () => {
    const onSelect = vi.fn();
    render(<AddressAutocompleteField id="address" label="Adresse" onSelect={onSelect} />);
    const input = screen.getByLabelText('Adresse');
    fireEvent.change(input, { target: { value: 'rue test' } });
    await screen.findByRole('listbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'Tab' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('ferme avec Échap et se rouvre au focus', async () => {
    render(<AddressAutocompleteField id="address" label="Adresse" onSelect={vi.fn()} />);
    const input = screen.getByLabelText('Adresse');
    fireEvent.change(input, { target: { value: 'rue test' } });
    await screen.findByRole('listbox');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeVisible();
    fireEvent.change(input, { target: { value: 'nouvelle recherche' } });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('ferme au clic extérieur mais pas lors d’une interaction dans la liste', async () => {
    render(<><AddressAutocompleteField id="address" label="Adresse" onSelect={vi.fn()} /><button>Extérieur</button></>);
    fireEvent.change(screen.getByLabelText('Adresse'), { target: { value: 'rue test' } });
    const listbox = await screen.findByRole('listbox');
    fireEvent.pointerDown(listbox);
    expect(screen.getByRole('listbox')).toBeVisible();
    fireEvent.pointerDown(screen.getByText('Extérieur'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('positionne la liste sous le champ et suit le viewport', async () => {
    render(<AddressAutocompleteField id="address" label="Adresse" onSelect={vi.fn()} />);
    const input = screen.getByLabelText('Adresse');
    vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({ left: 20, right: 320, top: 100, bottom: 140, width: 300, height: 40, x: 20, y: 100, toJSON: vi.fn() });
    fireEvent.change(input, { target: { value: 'rue test' } });
    const listbox = await screen.findByRole('listbox');
    await waitFor(() => expect(listbox).toHaveStyle({ left: '20px', top: '144px', width: '300px', maxHeight: '288px' }));
    fireEvent.scroll(window);
    fireEvent.resize(window);
    expect(listbox.style.maxHeight).toBe('288px');
    input.remove();
    fireEvent.scroll(window);
  });

  it('ouvre la liste au-dessus si le bas du viewport est insuffisant', async () => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 400 });
    render(<AddressAutocompleteField id="address" label="Adresse" onSelect={vi.fn()} />);
    const input = screen.getByLabelText('Adresse');
    vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({ left: 10, right: 210, top: 350, bottom: 390, width: 200, height: 40, x: 10, y: 350, toJSON: vi.fn() });
    fireEvent.change(input, { target: { value: 'rue test' } });
    const listbox = await screen.findByRole('listbox');
    await waitFor(() => expect(listbox).toHaveStyle({ bottom: '54px', maxHeight: '288px' }));
  });

  it('gère une suggestion sans localité et active une option à la souris', async () => {
    vi.mocked(searchAddressSuggestions).mockResolvedValueOnce([{ label: 'Lieu sans localité' }]);
    render(<AddressAutocompleteField id="address" label="Adresse" onSelect={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Adresse'), { target: { value: 'lieu test' } });
    const option = await screen.findByRole('option');
    fireEvent.mouseEnter(option.querySelector('button')!);
    expect(option).toHaveAttribute('aria-selected', 'true');
    fireEvent.mouseDown(option.querySelector('button')!);
  });
});
