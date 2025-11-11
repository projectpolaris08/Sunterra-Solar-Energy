import { useState } from 'react';
import { ChevronDown, Sun, HelpCircle } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import SEO from '../components/SEO';

interface FAQProps {
  onNavigate: (page: string) => void;
}

export default function FAQ({ onNavigate }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How much does a solar panel system cost in the Philippines?',
          answer: 'The cost varies based on system size and type. A typical residential grid-tie system (5kW) ranges from ₱250,000 to ₱350,000. Hybrid systems with battery backup cost ₱400,000 to ₱600,000. We offer free site assessments to provide accurate quotes based on your specific needs.'
        },
        {
          question: 'How long does it take to install a solar system?',
          answer: 'Residential installations typically take 2-5 days, while commercial projects may take 1-4 weeks depending on system size. The timeline includes permits, installation, grid connection (if applicable), and final inspection.'
        },
        {
          question: 'Do I need permits for solar installation?',
          answer: 'Yes, solar installations require permits from your local government and electrical inspection. For grid-tie systems, you also need approval from your utility company for net metering. Sunterra Solar handles all permit applications and coordination as part of our service.'
        },
        {
          question: 'What is the return on investment (ROI) for solar panels?',
          answer: 'Most residential systems achieve ROI in 4-6 years. With 25+ year panel warranties and minimal maintenance, you can enjoy 15-20 years of free electricity. Commercial installations often see even faster ROI due to higher consumption rates.'
        }
      ]
    },
    {
      category: 'System Types',
      questions: [
        {
          question: 'What is the difference between grid-tie, hybrid, and off-grid systems?',
          answer: 'Grid-tie systems connect to the utility grid, allowing net metering and lower costs. Hybrid systems combine solar panels, batteries, and grid connection for backup power. Off-grid systems are completely independent, ideal for remote locations but require larger battery banks.'
        },
        {
          question: 'Which solar system is best for my home?',
          answer: 'It depends on your location and needs. Grid-tie is best for urban areas with stable power. Hybrid is ideal if you experience frequent outages. Off-grid suits remote properties without grid access. Our experts provide personalized recommendations during the free site assessment.'
        },
        {
          question: 'Can I add batteries to my grid-tie system later?',
          answer: 'Yes! Many customers start with grid-tie and upgrade to hybrid later. However, it\'s more cost-effective to plan for batteries initially. We design systems with future expansion in mind.'
        }
      ]
    },
    {
      category: 'Performance & Maintenance',
      questions: [
        {
          question: 'How much electricity will my solar panels generate?',
          answer: 'In the Philippines, a 1kW system typically generates 4-5 kWh per day (1,460-1,825 kWh annually). A 5kW residential system produces 20-25 kWh daily, enough for most Filipino households. Actual output depends on location, shading, and panel orientation.'
        },
        {
          question: 'What happens during cloudy days or at night?',
          answer: 'Solar panels still generate power on cloudy days, though at reduced capacity (10-25% of peak output). At night, grid-tie systems draw power from the utility grid, while hybrid and off-grid systems use stored battery power.'
        },
        {
          question: 'How often do solar panels need maintenance?',
          answer: 'Solar panels require minimal maintenance. We recommend cleaning 2-3 times per year (more frequently in dusty areas) and annual professional inspections. Our systems come with monitoring software to track performance and alert you to any issues.'
        },
        {
          question: 'What is the lifespan of solar panels?',
          answer: 'Quality solar panels last 25-30+ years. Most manufacturers warranty 80-90% performance after 25 years. Inverters typically last 10-15 years and may need replacement once during the system\'s lifetime.'
        }
      ]
    },
    {
      category: 'Financial',
      questions: [
        {
          question: 'Are there financing options available?',
          answer: 'Yes, we partner with banks offering solar loans with competitive interest rates. Many customers opt for 3-5 year payment plans. Some systems pay for themselves through electricity savings before the loan term ends.'
        },
        {
          question: 'What is net metering and how does it work?',
          answer: 'Net metering allows you to sell excess solar electricity back to the grid. Your meter runs backward when you generate more than you consume. You only pay for "net" consumption (used minus generated). This maximizes savings from your grid-tie system.'
        },
        {
          question: 'How much can I save on my electricity bill?',
          answer: 'Most customers save 70-90% on electricity bills. A properly sized system can offset nearly all daytime consumption. With net metering, excess generation during low-usage periods credits your account for nighttime use.'
        }
      ]
    },
    {
      category: 'Technical',
      questions: [
        {
          question: 'Will solar panels work during a brownout?',
          answer: 'Grid-tie systems automatically shut off during brownouts for safety (protecting utility workers). Hybrid systems with batteries can provide backup power during outages. Off-grid systems are unaffected by grid issues.'
        },
        {
          question: 'How much roof space do I need?',
          answer: 'A typical 5kW residential system requires 25-35 square meters of unshaded roof space. We can work with various roof types (concrete, metal, tile) and orientations. Ground-mounted systems are also available if roof space is limited.'
        },
        {
          question: 'Are solar panels affected by typhoons?',
          answer: 'Our systems are engineered for Philippine weather conditions, including typhoons. Panels are tested to withstand winds up to 200+ km/h and are securely mounted to prevent damage. We use reinforced mounting systems for added safety.'
        }
      ]
    }
  ];

  const allQuestions = faqs.flatMap((category, catIndex) =>
    category.questions.map((q, qIndex) => ({
      ...q,
      category: category.category,
      globalIndex: catIndex * 100 + qIndex
    }))
  );

  return (
    <>
      <SEO
        title="Frequently Asked Questions - Solar Installation Philippines"
        description="Get answers to common questions about solar panel installation in the Philippines. Learn about costs, ROI, system types, maintenance, net metering, and more from Sunterra Solar Energy experts."
        keywords="solar FAQ Philippines, solar panel cost, solar installation questions, net metering Philippines, solar ROI, solar maintenance"
      />

      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-amber-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              Everything you need to know about solar installation in the Philippines
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            {faqs.map((category, index) => (
              <Card key={index} className="text-center">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">{category.questions.length}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{category.category}</h3>
                <p className="text-sm text-gray-600">Questions answered</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {faqs.map((category, catIndex) => (
              <div key={catIndex}>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                    {catIndex + 1}
                  </span>
                  {category.category}
                </h2>

                <div className="space-y-4">
                  {category.questions.map((faq, qIndex) => {
                    const globalIndex = catIndex * 100 + qIndex;
                    const isOpen = openIndex === globalIndex;

                    return (
                      <Card
                        key={qIndex}
                        hover={false}
                        className={`transition-all duration-300 cursor-pointer ${
                          isOpen ? 'ring-2 ring-blue-600' : ''
                        }`}
                        onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 pr-4 flex-1">
                            {faq.question}
                          </h3>
                          <ChevronDown
                            className={`w-6 h-6 text-blue-600 flex-shrink-0 transition-transform duration-300 ${
                              isOpen ? 'transform rotate-180' : ''
                            }`}
                          />
                        </div>

                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isOpen ? 'max-h-96 mt-4' : 'max-h-0'
                          }`}
                        >
                          <div className="pt-4 border-t border-gray-200">
                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100">
            <Sun className="w-16 h-16 text-amber-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Our solar experts are here to help. Get in touch for personalized answers and a free site assessment.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => onNavigate('contact')}
              >
                Contact Our Experts
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate('services')}
              >
                View Services
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
