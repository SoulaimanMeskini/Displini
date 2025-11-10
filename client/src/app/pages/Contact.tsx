import { useState } from 'react';
import { Send, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { SEO } from '@/app/components/shared/SEO';
import { colors } from '@/lib/designSystem';
import { handleSuccess, handleError } from '@/lib/errorHandling';
import { Header } from '@/app/pages/landing/components/Header';
import { LandingFooter } from '@/app/pages/landing/components/LandingFooter';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Send to backend API
      // await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      handleSuccess('Message sent! We\'ll get back to you soon.', 'Thank You');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      handleError(error, { 
        title: 'Failed to Send Message',
        description: 'Please try again or email us directly at hello@displini.com'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24" style={{ backgroundColor: colors.background.light }}>
        <SEO
          title="Contact Us"
          description="Get in touch with the Displini team. We'd love to hear from you!"
          url="https://displini.com/contact"
        />
      
      <div className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-gray-900">Get in Touch</h1>
            <p className="text-xl text-gray-600">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${colors.brand.primary}20` }}
                  >
                    <Mail className="w-6 h-6" style={{ color: colors.brand.primary }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a href="mailto:hello@displini.com" className="text-gray-600 hover:text-primary">
                      hello@displini.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${colors.brand.secondary}20` }}
                  >
                    <MessageSquare className="w-6 h-6" style={{ color: colors.brand.secondary }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
                    <p className="text-gray-600">
                      Available Monday-Friday, 9am-5pm CET
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Quick Response Time</h3>
                <p className="text-gray-600 text-sm">
                  We typically respond within 24 hours on business days.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Your name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="your.email@example.com"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    placeholder="How can we help?"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    placeholder="Tell us more..."
                    rows={6}
                    className="mt-1"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
      </div>
      <LandingFooter />
    </>
  );
}

