import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import SEO from "../components/SEO";

interface ContactProps {
  onNavigate: (page: string) => void;
}

export default function Contact({ onNavigate }: ContactProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    propertyType: "",
    systemType: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Determine the API URL based on environment
      // Frontend on Hostinger, backend on Vercel
      // IMPORTANT: Set VITE_API_URL to your Vercel deployment URL when building for production
      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error(
          "API URL is not configured. Please set VITE_API_URL environment variable to your Vercel deployment URL (e.g., https://your-project.vercel.app)"
        );
      }

      const endpoint = "/api/contact";
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        // If status is 200 but not JSON, it might be an HTML error page
        if (response.status === 200) {
          throw new Error(
            `Server returned HTML instead of JSON. This usually means the serverless function isn't being called. Response preview: ${text.substring(
              0,
              100
            )}`
          );
        }
        throw new Error(
          `Server error: ${response.status} ${
            response.statusText
          }. ${text.substring(0, 100)}`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to send message. Please try again."
        );
      }

      // Success - show success message
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        propertyType: "",
        systemType: "",
        message: "",
      });

      // Reset after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send message. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      detail: "+63 960 692 1760",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Mail,
      title: "Email",
      detail: "info@sunterrasolarenergy.com",
      color: "from-amber-500 to-amber-600",
    },
    {
      icon: MapPin,
      title: "Location",
      detail: "San Jose del Monte, Bulacan",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Clock,
      title: "Business Hours",
      detail: "Mon - Sat: 8:00 AM - 6:00 PM",
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <>
      <SEO
        title="Contact Us - Free Solar Site Assessment"
        description="Contact Sunterra Solar Energy Philippines for a free site assessment. Get expert advice on solar panel installation for your home or business. Call +63 960 692 1760 or email info@sunterrasolarenergy.com"
        keywords="contact solar installer Philippines, free solar assessment, solar consultation Manila, Sunterra Solar contact"
      />

      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Let's Start Your Solar Journey
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Get in touch for a free site assessment and personalized solar
              solution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {contactInfo.map((info, index) => (
              <Card key={index}>
                <div
                  className={`bg-gradient-to-br ${info.color} p-3 rounded-xl inline-block mb-4`}
                >
                  <info.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {info.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {info.detail}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Request a Free Site Assessment
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                Fill out the form and our solar experts will contact you within
                24 hours to schedule your free on-site assessment. We'll
                evaluate your property, discuss your energy needs, and provide a
                customized solar solution.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 dark:bg-gray-700 rounded-full p-2 flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Submit Your Information
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Complete the form with your details and requirements
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 dark:bg-gray-700 rounded-full p-2 flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Schedule Assessment
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Our team will contact you to arrange a convenient time
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 dark:bg-gray-700 rounded-full p-2 flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      3
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Get Your Proposal
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Receive a detailed quote and customized solar system
                      design
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
                  Connect With Us:
                </p>
                <div className="flex space-x-4">
                  <a
                    href="https://www.facebook.com/sunterrasolarenergy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.instagram.com/sunterra_solar_energy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@sunterra_solar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.reddit.com/user/Big_Protection_4086/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/jayar-barallas-178702397/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#0077B5] text-white rounded-lg hover:bg-[#005885] transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.youtube.com/@SunterraSolarEnergy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            <Card>
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Thank You!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your message has been received. We'll contact you within 24
                    hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      placeholder="Juan dela Cruz"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        placeholder="juan@email.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        placeholder="+63 917 123 4567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="propertyType"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Property Type *
                      </label>
                      <select
                        id="propertyType"
                        name="propertyType"
                        required
                        value={formData.propertyType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      >
                        <option value="">Select type</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="industrial">Industrial</option>
                        <option value="agricultural">Agricultural</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="systemType"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        System Interest *
                      </label>
                      <select
                        id="systemType"
                        name="systemType"
                        required
                        value={formData.systemType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      >
                        <option value="">Select system</option>
                        <option value="grid-tie">Grid-Tie Solar</option>
                        <option value="hybrid">Hybrid Solar</option>
                        <option value="off-grid">Off-Grid Solar</option>
                        <option value="not-sure">Not Sure</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
                      placeholder="Tell us about your energy needs, monthly consumption, or any specific questions..."
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block animate-spin mr-2">
                          ⏳
                        </span>
                        Sending...
                      </>
                    ) : (
                      <>
                        Submit Request
                        <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    By submitting this form, you agree to be contacted by
                    Sunterra Solar Energy
                  </p>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Visit Our Office
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              We serve clients from San Jose Del Monte, Bulacan, the Rising City
              shaping tomorrow.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Card className="overflow-hidden">
              <div className="h-96 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3850.5!2d121.0!3d14.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDQ4JzAwLjAiTiAxMjHCsDAwJzAwLjAiRQ!5e0!3m2!1sen!2sph!4v1234567890123!5m2!1sen!2sph"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                  title="Sunterra Solar Energy Office Location"
                ></iframe>
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Sunterra Solar Energy
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    San Jose del Monte, Bulacan, Philippines
                  </p>
                  <a
                    href="https://maps.app.goo.gl/xDhxzYJPqjCxVVV7A"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Make the Switch?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of satisfied customers saving money and the
              environment
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Request Assessment
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate("projects")}
                className="bg-white text-blue-600 hover:bg-gray-50 border-white"
              >
                View Projects
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
