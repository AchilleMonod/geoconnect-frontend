import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentsSection } from './DocumentsSection';

describe('DocumentsSection', () => {
  it('présente cinq documents et seulement les deux liens fournis', () => {
    render(<DocumentsSection />);
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(5);
    expect(cards.map(card => within(card).getByRole('heading', { level: 3 }).textContent)).toEqual([
      'Extrait cadastral', 'Plan topographique', 'Photo des accès', 'Plan des réseaux privés', 'Plan de situation',
    ]);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute('href', 'https://www.geoportail.gouv.fr/carte');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAccessibleName(/nouvel onglet/);
    }
    expect(within(cards[3]).queryByRole('heading', { level: 4 })).toBeNull();
    expect(within(cards[3]).queryByRole('link')).toBeNull();
    expect(screen.queryByText(/DICT|en préparation|à valider/i)).toBeNull();
  });

  it('permet de naviguer dans les deux sens au clavier et respecte les animations réduites', async () => {
    const user = userEvent.setup();
    render(<DocumentsSection />);
    const carousel = screen.getByRole('region', { name: 'Documents à préparer' });
    const scrollBy = vi.fn();
    Object.defineProperty(carousel, 'scrollBy', { value: scrollBy });
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    try {
      await user.click(screen.getByRole('button', { name: 'Documents suivants' }));
      await user.keyboard('{Enter}');
      await user.click(screen.getByRole('button', { name: 'Documents précédents' }));
      expect(scrollBy).toHaveBeenCalledTimes(3);
      expect(scrollBy.mock.calls[0][0]).toMatchObject({ behavior: 'instant' });
      expect(scrollBy.mock.calls[0][0].left).toBeGreaterThan(0);
      expect(scrollBy.mock.calls[2][0].left).toBeLessThan(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
