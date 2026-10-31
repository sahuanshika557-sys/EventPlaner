import React from 'react';
import { Utensils } from 'lucide-react';
import { Badge } from '../common/Badge';
import type { StructuredEventPlan } from '../../services/aiService';

interface CateringMenuCardProps {
  menu: StructuredEventPlan['menu'];
}

export const CateringMenuCard: React.FC<CateringMenuCardProps> = ({ menu }) => {
  return (
    <article
      className="glass-panel card-hover-lift animate-fade-in-up stagger-4"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Utensils size={20} color="#f59e0b" />
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            4. Artisanal Banquet & Catering Menu
          </h4>
        </div>
        <Badge variant="gold" size="sm">
          Chef Curated
        </Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
        <div style={{ backgroundColor: '#090d16', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '0.25rem' }}>Welcome Drinks & Elixirs</strong>
          <span style={{ color: '#cbd5e1' }}>{menu.welcomeDrinks.join(' • ')}</span>
        </div>

        <div style={{ backgroundColor: '#090d16', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '0.25rem' }}>Appetizers & Canapés</strong>
          <span style={{ color: '#cbd5e1' }}>{menu.appetizers.join(' • ')}</span>
        </div>

        <div style={{ backgroundColor: '#090d16', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '0.25rem' }}>Signature Main Course</strong>
          <span style={{ color: '#cbd5e1' }}>{menu.mainCourse.join(' • ')}</span>
        </div>

        <div style={{ backgroundColor: '#090d16', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '0.25rem' }}>Grand Desserts & Sweets</strong>
          <span style={{ color: '#cbd5e1' }}>{menu.desserts.join(' • ')}</span>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.25rem 0.5rem' }}>
          🛡️ {menu.dietaryAccommodations}
        </div>
      </div>
    </article>
  );
};

