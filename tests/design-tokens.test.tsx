import React from 'react';
import { render, screen } from '@testing-library/react';

function DesignTokenShowcase() {
  return (
    <div className="bg-ivory text-charcoal border-border-editorial p-6 rounded-lg">
      <h1 className="text-son-red font-bold text-2xl">Việt Phục Remix</h1>
      <p className="text-charcoal-muted">Sắc màu di sản truyền thống</p>
      <div className="flex gap-2 mt-4">
        <span className="w-6 h-6 rounded-full bg-son-red" data-testid="token-son-red" />
        <span className="w-6 h-6 rounded-full bg-luc-green" data-testid="token-luc-green" />
        <span className="w-6 h-6 rounded-full bg-vang-gold" data-testid="token-vang-gold" />
      </div>
    </div>
  );
}

describe('Design Tokens Verification', () => {
  it('renders design token showcase with appropriate editorial classes', () => {
    render(<DesignTokenShowcase />);
    expect(screen.getByText('Việt Phục Remix')).toHaveClass('text-son-red');
    expect(screen.getByText('Sắc màu di sản truyền thống')).toHaveClass('text-charcoal-muted');
    expect(screen.getByTestId('token-son-red')).toBeInTheDocument();
    expect(screen.getByTestId('token-luc-green')).toBeInTheDocument();
    expect(screen.getByTestId('token-vang-gold')).toBeInTheDocument();
  });
});
