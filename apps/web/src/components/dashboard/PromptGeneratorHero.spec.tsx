import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptGeneratorHero } from './PromptGeneratorHero';

describe('PromptGeneratorHero', () => {
  it('renders hero title and prompt textarea', () => {
    const handleStart = vi.fn();
    render(<PromptGeneratorHero onStartGenerating={handleStart} />);

    expect(screen.getByText(/Transform any idea into an/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Describe what you want to present/i)).toBeInTheDocument();
  });

  it('triggers generation callback when user inputs prompt and clicks button', () => {
    const handleStart = vi.fn();
    render(<PromptGeneratorHero onStartGenerating={handleStart} />);

    const textarea = screen.getByPlaceholderText(/Describe what you want to present/i);
    fireEvent.change(textarea, { target: { value: 'Create 8 slides about Autonomous Agents' } });

    const submitBtn = screen.getByRole('button', { name: /Configure & Generate/i });
    expect(submitBtn).toBeEnabled();

    fireEvent.click(submitBtn);
    expect(handleStart).toHaveBeenCalledWith('Create 8 slides about Autonomous Agents');
  });

  it('populates textarea when clicking a quick suggestion chip', () => {
    const handleStart = vi.fn();
    render(<PromptGeneratorHero onStartGenerating={handleStart} />);

    const suggestion = screen.getByText(/10-slide pitch for a Next-Gen AI Risk & Compliance Platform/i);
    fireEvent.click(suggestion);

    const textarea = screen.getByPlaceholderText(/Describe what you want to present/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe('10-slide pitch for a Next-Gen AI Risk & Compliance Platform');
  });
});
