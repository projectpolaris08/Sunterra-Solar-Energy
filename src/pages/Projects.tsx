import { MapPin, Zap, Calendar, CheckCircle, Sun } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import SEO from '../components/SEO';

interface ProjectsProps {
  onNavigate: (page: string) => void;
}

export default function Projects({ onNavigate }: ProjectsProps) {
  const projects = [
    {
      id: 1,
      title: 'Luxury Residential Villa',
      location: 'Alabang, Metro Manila',
      systemType: 'Grid-Tie Solar',
      capacity: '12kW',
      installDate: 'March 2024',
      description: 'Modern villa installation with premium solar panels. Reduced electricity costs by 85% while maintaining aesthetic appeal.',
      color: 'from-blue-400 to-blue-600',
      savings: '₱15,000/month'
    },
    {
      id: 2,
      title: 'Commercial Office Complex',
      location: 'BGC, Taguig City',
      systemType: 'Hybrid Solar',
      capacity: '150kW',
      installDate: 'January 2024',
      description: 'Large-scale commercial installation with battery backup ensuring uninterrupted operations during peak hours.',
      color: 'from-amber-400 to-amber-600',
      savings: '₱180,000/month'
    },
    {
      id: 3,
      title: 'Mountain Farmhouse',
      location: 'Tagaytay, Cavite',
      systemType: 'Off-Grid Solar',
      capacity: '8kW',
      installDate: 'December 2023',
      description: 'Complete off-grid solution for remote property. Full energy independence with battery storage system.',
      color: 'from-green-400 to-green-600',
      savings: '100% energy independent'
    },
    {
      id: 4,
      title: 'Manufacturing Facility',
      location: 'Calamba, Laguna',
      systemType: 'Grid-Tie Solar',
      capacity: '300kW',
      installDate: 'November 2023',
      description: 'Industrial-scale installation reducing operational costs significantly. ROI achieved in 3.5 years.',
      color: 'from-purple-400 to-purple-600',
      savings: '₱350,000/month'
    },
    {
      id: 5,
      title: 'Beachfront Resort',
      location: 'Boracay, Aklan',
      systemType: 'Hybrid Solar',
      capacity: '45kW',
      installDate: 'October 2023',
      description: 'Resort installation combining solar with battery backup for reliable power in island location.',
      color: 'from-cyan-400 to-cyan-600',
      savings: '₱55,000/month'
    },
    {
      id: 6,
      title: 'Suburban Family Home',
      location: 'Quezon City',
      systemType: 'Grid-Tie Solar',
      capacity: '6kW',
      installDate: 'September 2023',
      description: 'Typical residential installation. Family of 5 now enjoys minimal electricity bills year-round.',
      color: 'from-blue-400 to-blue-600',
      savings: '₱8,500/month'
    },
    {
      id: 7,
      title: 'Shopping Center',
      location: 'Makati City',
      systemType: 'Grid-Tie Solar',
      capacity: '200kW',
      installDate: 'August 2023',
      description: 'Rooftop installation on major shopping center. Significant reduction in daytime energy costs.',
      color: 'from-amber-400 to-amber-600',
      savings: '₱240,000/month'
    },
    {
      id: 8,
      title: 'Rural Farm Estate',
      location: 'Batangas Province',
      systemType: 'Off-Grid Solar',
      capacity: '15kW',
      installDate: 'July 2023',
      description: 'Large off-grid system for agricultural operations. Powers farm equipment and living quarters.',
      color: 'from-green-400 to-green-600',
      savings: '100% energy independent'
    },
    {
      id: 9,
      title: 'Hotel & Conference Center',
      location: 'Cebu City',
      systemType: 'Hybrid Solar',
      capacity: '120kW',
      installDate: 'June 2023',
      description: 'Hospitality sector installation with backup power. Ensures guest comfort during power interruptions.',
      color: 'from-purple-400 to-purple-600',
      savings: '₱145,000/month'
    }
  ];

  const categories = [
    { name: 'All Projects', count: projects.length },
    { name: 'Residential', count: 3 },
    { name: 'Commercial', count: 4 },
    { name: 'Off-Grid', count: 2 }
  ];

  return (
    <>
      <SEO
        title="Solar Installation Projects Portfolio"
        description="View our completed solar panel installation projects across the Philippines. Residential, commercial, and off-grid solar systems. Real results from satisfied customers in Manila, Cebu, and nationwide."
        keywords="solar projects Philippines, solar installation portfolio, completed solar projects, residential solar Manila, commercial solar installation"
      />

      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-amber-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Our Project Portfolio
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              Explore our successful solar installations across the Philippines. Real projects, real savings, real impact.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  index === 0
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                }`}
              >
                {category.name} <span className="ml-2 text-sm">({category.count})</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <div className={`bg-gradient-to-br ${project.color} h-48 -mx-6 -mt-6 mb-6 flex flex-col items-center justify-center relative`}>
                  <Sun className="w-24 h-24 text-white opacity-50 absolute" />
                  <div className="relative z-10 text-center text-white">
                    <p className="text-sm font-medium mb-1">System Capacity</p>
                    <p className="text-4xl font-bold">{project.capacity}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>

                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-blue-600" />
                    <span>{project.location}</span>
                  </div>

                  <div className="flex items-start text-sm text-gray-600">
                    <Zap className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-amber-500" />
                    <span>{project.systemType}</span>
                  </div>

                  <div className="flex items-start text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-green-600" />
                    <span>{project.installDate}</span>
                  </div>

                  <p className="text-gray-700 leading-relaxed pt-2">
                    {project.description}
                  </p>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Monthly Savings</p>
                        <p className="text-lg font-bold text-green-600">{project.savings}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              By the Numbers
            </h2>
            <p className="text-xl text-gray-600">
              Our impact across the Philippines
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { number: '500+', label: 'Completed Projects', color: 'text-blue-600' },
              { number: '50MW+', label: 'Total Capacity', color: 'text-amber-600' },
              { number: '₱500M+', label: 'Total Savings', color: 'text-green-600' },
              { number: '25,000+', label: 'Tons CO₂ Reduced', color: 'text-purple-600' }
            ].map((stat, index) => (
              <Card key={index} className="text-center">
                <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center bg-white">
            <Sun className="w-16 h-16 text-amber-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Start Your Solar Project?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join hundreds of satisfied customers who have made the switch to clean, affordable solar energy
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => onNavigate('contact')}
              >
                Get Free Assessment
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
