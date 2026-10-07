import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home Page (Main Assembly)', () => {
  it('renders editorial header, OutfitPreview, and RemixControls', () => {
    render(<Home />);

    // Brand headline
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/VIỆT PHỤC REMIX/i);

    // OutfitPreview elements
    expect(screen.getAllByText(/Triều Nguyễn/i).length).toBeGreaterThan(0);

    // RemixControls elements
    expect(screen.getByText(/Phòng Thử Trang Phục/i)).toBeInTheDocument();
    expect(screen.getByTestId('reset-colors-btn')).toBeInTheDocument();
  });
});
