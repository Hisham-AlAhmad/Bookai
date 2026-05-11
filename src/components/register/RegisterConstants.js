export const CATEGORY_LABELS = {
  barbershop: 'Barbershop',
  salon: 'Salon',
  clinic: 'Clinic',
  tutor: 'Tutor',
  mechanic: 'Mechanic',
  other: 'Other',
}

export const PLAN_CONFIG = {
  free: {
    name: 'Free',
    price: '$0',
    period: '/month',
    tagline: 'Perfect for getting started',
    badge: null,
    highlight: false,
    features: [
      '1 staff member',
      'Public booking page',
      'Basic calendar view',
      'Form-based bookings',
    ],
  },
  starter: {
    name: 'Starter',
    price: '$15',
    period: '/month',
    tagline: 'For growing businesses',
    badge: null,
    highlight: false,
    features: [
      'Up to 3 staff members',
      'SMS reminders',
      'Voice booking (AI)',
      'Analytics dashboard',
    ],
  },
  pro: {
    name: 'Pro',
    price: '$40',
    period: '/month',
    tagline: 'For high-volume businesses',
    badge: 'Most Popular',
    highlight: true,
    features: [
      'Unlimited staff',
      'Priority SMS delivery',
      'Voice booking',
      'Advanced analytics',
      'Custom domain',
    ],
  },
}