import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SlideRenderer } from './SlideRenderer';
import { Slide } from '@ai-slide-studio/shared';

describe('SlideRenderer', () => {
  const sampleSlide: Slide = {
    id: 'slide-1',
    slideNumber: 1,
    layout: 'cover',
    content: {
      title: 'Enterprise AI Architecture',
      subtitle: 'Scalable and Resilient Cloud AI Systems',
      badge: 'Confidential Keynote',
    },
    notes: 'Introduce high-level topic and mission statement',
    animation: {
      preset: 'fade-in',
      duration: 0.8,
      delay: 0,
      easing: 'power2.out',
      direction: 'none',
    },
    transition: {
      type: 'fade',
      duration: 0.6,
      easing: 'power2.out',
    },
  };

  it('renders cover slide title and subtitle', () => {
    render(<SlideRenderer slide={sampleSlide} themeName="modern-dark" />);
    expect(screen.getByText('Enterprise AI Architecture')).toBeInTheDocument();
    expect(screen.getByText('Scalable and Resilient Cloud AI Systems')).toBeInTheDocument();
    expect(screen.getByText('Confidential Keynote')).toBeInTheDocument();
  });

  it('renders statistics layout with numeric values and labels', () => {
    const statsSlide: Slide = {
      id: 'slide-2',
      slideNumber: 2,
      layout: 'statistics',
      content: {
        title: 'Key Operational Metrics',
        statistics: [
          { id: 's1', value: '99.99%', label: 'Uptime SLA', icon: 'shield', subtext: 'Global' },
          { id: 's2', value: '4.2x', label: 'Speed Multiplier', icon: 'zap', subtext: 'Accelerated' },
        ],
      },
    };

    render(<SlideRenderer slide={statsSlide} themeName="modern-dark" />);
    expect(screen.getByText('Key Operational Metrics')).toBeInTheDocument();
    expect(screen.getByText('99.99%')).toBeInTheDocument();
    expect(screen.getByText('Uptime SLA')).toBeInTheDocument();
    expect(screen.getByText('4.2x')).toBeInTheDocument();
  });

  it('renders quote slide with quote text and author', () => {
    const quoteSlide: Slide = {
      id: 'slide-3',
      slideNumber: 3,
      layout: 'quote',
      content: {
        title: 'Industry Perspective',
        quote: 'Autonomous coding agents are revolutionizing the velocity of software development.',
        author: 'Lead Architect',
      },
    };

    render(<SlideRenderer slide={quoteSlide} themeName="corporate-blue" />);
    expect(screen.getByText(/Autonomous coding agents/)).toBeInTheDocument();
    expect(screen.getByText('Lead Architect')).toBeInTheDocument();
  });

  it('guarantees NO emojis in rendered text content', () => {
    const { container } = render(
      <SlideRenderer slide={sampleSlide} themeName="modern-dark" />
    );
    // Regex for emoji ranges
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(container.textContent || '')).toBe(false);
  });
});
