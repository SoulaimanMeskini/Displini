import { Check, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { SEO } from '@/app/components/shared/SEO';
import { colors } from '@/lib/designSystem';
import { Header } from '@/app/pages/landing/components/Header';
import { LandingFooter } from '@/app/pages/landing/components/LandingFooter';
import { LandingFAQ } from '@/app/pages/landing/components/LandingFAQ';

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        'Todo lists & reminders',
        'Basic water tracking',
        'Calendar integration',
        'Up to 50 tasks/month'
      ],
      limitations: [
        'AI features',
        'Advanced analytics',
        'Multiple devices',
        'Data export'
      ],
      cta: 'Get Started',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$4.99',
      period: '/month',
      description: 'For serious productivity',
      features: [
        'Everything in Free',
        'Unlimited tasks',
        'AI assistant',
        'Advanced analytics',
        'Sync across devices',
        'Data export',
        'Priority support',
        'Custom themes'
      ],
      limitations: [],
      cta: 'Start Free Trial',
      highlighted: true
    },
    {
      name: 'Lifetime',
      price: '$49.99',
      description: 'One-time payment',
      features: [
        'Everything in Pro',
        'Lifetime access',
        'Future features',
        'No subscription',
        'VIP support'
      ],
      limitations: [],
      cta: 'Buy Once',
      highlighted: false
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <SEO
          title="Pricing"
          description="Simple, transparent pricing for Displini. Start free or go Pro for advanced features."
          keywords="pricing, subscription, plans, free trial"
          url="https://displini.com/pricing"
        />
      
      {/* Pricing Content */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">Simple Pricing</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Choose the plan that works for you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 transition-transform hover:scale-105 ${
                  plan.highlighted 
                    ? 'bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary shadow-xl md:scale-105' 
                    : 'bg-white dark:bg-gray-800 shadow-lg'
                }`}
              >
                {plan.highlighted && (
                  <div className="text-center mb-4">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, i) => (
                    <li key={i} className="flex items-start opacity-50">
                      <X className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-500 dark:text-gray-500">{limitation}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${plan.highlighted ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  aria-label={`Choose ${plan.name} plan`}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>

          {/* FAQ Section - Same as Landing Page, but without help text */}
          <div className="mt-20">
            <LandingFAQ showHelpText={false} />
          </div>
        </div>
      </div>
      </div>
      <LandingFooter />
    </>
  );
}

