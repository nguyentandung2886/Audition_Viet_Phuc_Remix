import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Test Environment Setup', () => {
  it('should render a test component and find element in DOM', () => {
    render(<div data-testid="setup-test">Việt Phục Remix Initialized</div>);
    const element = screen.getByTestId('setup-test');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Việt Phục Remix Initialized');
  });
});
