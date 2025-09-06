import React from 'react';
import { Logo } from './index';

const LogoDemo = () => {
  return (
    <div className="p-8 space-y-8 bg-background-primary">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-text-primary mb-4">Logo Showcase</h1>
        <p className="text-text-secondary">Double Helix + U Logo in various sizes and variants</p>
      </div>

      {/* Size Variations */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-text-primary">Size Variations</h2>
        <div className="flex items-center space-x-6 p-6 bg-background-secondary rounded-xl">
          <div className="text-center">
            <Logo size="xs" />
            <p className="text-sm text-text-muted mt-2">XS</p>
          </div>
          <div className="text-center">
            <Logo size="sm" />
            <p className="text-sm text-text-muted mt-2">SM</p>
          </div>
          <div className="text-center">
            <Logo size="md" />
            <p className="text-sm text-text-muted mt-2">MD</p>
          </div>
          <div className="text-center">
            <Logo size="lg" />
            <p className="text-sm text-text-muted mt-2">LG</p>
          </div>
          <div className="text-center">
            <Logo size="xl" />
            <p className="text-sm text-text-muted mt-2">XL</p>
          </div>
          <div className="text-center">
            <Logo size="2xl" />
            <p className="text-sm text-text-muted mt-2">2XL</p>
          </div>
        </div>
      </div>

      {/* Color Variations */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-text-primary">Color Variations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-background-secondary rounded-xl text-center">
            <Logo size="lg" variant="default" />
            <p className="text-sm text-text-muted mt-2">Default (White)</p>
          </div>
          <div className="p-6 bg-background-secondary rounded-xl text-center">
            <Logo size="lg" variant="primary" />
            <p className="text-sm text-text-muted mt-2">Primary (Blue)</p>
          </div>
          <div className="p-6 bg-background-secondary rounded-xl text-center">
            <Logo size="lg" variant="muted" />
            <p className="text-sm text-text-muted mt-2">Muted (Gray)</p>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-text-primary">Usage Examples</h2>
        
        {/* Header Example */}
        <div className="p-4 bg-background-secondary rounded-xl">
          <div className="flex items-center space-x-3">
            <Logo size="sm" variant="primary" />
            <h3 className="text-lg font-semibold text-text-primary">Untangle</h3>
          </div>
        </div>

        {/* Sidebar Example */}
        <div className="p-4 bg-background-secondary rounded-xl">
          <div className="flex items-center space-x-2">
            <Logo size="sm" variant="primary" />
            <span className="text-xl font-bold tracking-wide text-text-primary">Untangle</span>
          </div>
        </div>

        {/* Footer Example */}
        <div className="p-4 bg-background-secondary rounded-xl">
          <div className="flex items-center justify-center space-x-2">
            <Logo size="md" variant="muted" />
            <span className="text-sm text-text-muted">© 2024 Untangle. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoDemo;
