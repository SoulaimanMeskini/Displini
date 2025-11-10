import { useState } from 'react';
import { Lightbulb, TrendingUp, ThumbsUp, Send, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card } from '@/app/components/ui/card';
import { SEO } from '@/app/components/shared/SEO';
import { colors } from '@/lib/designSystem';
import { handleSuccess, handleError } from '@/lib/errorHandling';
import { Header } from '@/app/pages/landing/components/Header';
import { LandingFooter } from '@/app/pages/landing/components/LandingFooter';

export default function FeatureRequests() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Send to backend API
      // await fetch('/api/feature-requests', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      handleSuccess('Feature request submitted! We\'ll review it and get back to you.', 'Thank You');
      setFormData({ title: '', description: '', email: '' });
    } catch (error) {
      handleError(error, { title: 'Failed to Submit Request' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const popularRequests = [
    { title: 'Dark Mode', votes: 127, status: 'In Progress' },
    { title: 'Apple Watch App', votes: 95, status: 'Planned' },
    { title: 'Shared Calendars', votes: 73, status: 'Planned' },
    { title: 'Custom Themes', votes: 61, status: 'Completed' }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24" style={{ backgroundColor: colors.background.light }}>
        <SEO
          title="Feature Requests"
          description="Request new features and vote on upcoming additions to Displini."
          url="https://displini.com/feature-requests"
        />
      
      <div className="py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-gray-900">Feature Requests</h1>
            <p className="text-xl text-gray-600">
              Help us build the features you want. Share your ideas!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Popular Requests */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" style={{ color: colors.brand.primary }} />
                Popular Requests
              </h2>

              <div className="space-y-4">
                {popularRequests.map((request, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{request.title}</h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-gray-600">
                            <ThumbsUp className="w-4 h-4" />
                            {request.votes} votes
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            request.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Submit Request Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" style={{ color: colors.brand.secondary }} />
                Submit Your Idea
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Feature Title</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., Dark Mode Support"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="Describe the feature and how it would help you..."
                    rows={6}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Your Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    We'll notify you when we implement your feature!
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit Feature Request'}
                </Button>
              </form>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-16 bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div 
                  className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: colors.brand.primary }}
                >
                  1
                </div>
                <h3 className="font-semibold mb-2 text-gray-900">Submit</h3>
                <p className="text-sm text-gray-600">Share your feature idea with us</p>
              </div>
              <div className="text-center">
                <div 
                  className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: colors.brand.primary }}
                >
                  2
                </div>
                <h3 className="font-semibold mb-2 text-gray-900">Review</h3>
                <p className="text-sm text-gray-600">We review and prioritize requests</p>
              </div>
              <div className="text-center">
                <div 
                  className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: colors.brand.primary }}
                >
                  3
                </div>
                <h3 className="font-semibold mb-2 text-gray-900">Build</h3>
                <p className="text-sm text-gray-600">Top requests get built into the app</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      <LandingFooter />
    </>
  );
}

