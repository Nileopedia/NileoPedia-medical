import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SettingsModal } from '../components/ui/SettingsModal';

describe('SettingsModal Component', () => {
  it('opens with Settings title', () => {
    render(<SettingsModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('has close button', () => {
    render(<SettingsModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByLabelText('Close settings')).toBeInTheDocument();
  });

  it('has all tabs visible', () => {
    render(<SettingsModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /ai settings/i })).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('shows Response Length options in AI Settings', () => {
    render(<SettingsModal isOpen={true} onClose={() => {}} />);
    const aiTab = screen.getByRole('tab', { name: /ai settings/i });
    fireEvent.click(aiTab);
    expect(screen.getByText('Response Length')).toBeInTheDocument();
    expect(screen.getByText('Concise')).toBeInTheDocument();
    expect(screen.getByText('Detailed')).toBeInTheDocument();
  });

  it('has Save changes button', () => {
    render(<SettingsModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Save changes')).toBeInTheDocument();
  });
});