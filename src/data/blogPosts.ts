export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  fullContent?: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  image?: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Complete Guide to Solar Panel Installation in the Philippines",
    slug: "complete-guide-solar-panel-installation-philippines",
    excerpt:
      "Everything you need to know about installing solar panels in the Philippines, from permits to ROI calculations. Learn about grid-tie, hybrid, and off-grid systems.",
    content:
      "Installing solar panels in the Philippines has become increasingly popular as electricity costs continue to rise. This comprehensive guide covers everything from choosing the right system to understanding net metering and maximizing your return on investment.",
    fullContent: `
      <h2>Introduction to Solar Panel Installation</h2>
      <p>Installing solar panels in the Philippines has become increasingly popular as electricity costs continue to rise. This comprehensive guide covers everything from choosing the right system to understanding net metering and maximizing your return on investment.</p>
      
      <h2>Types of Solar Systems</h2>
      <h3>Grid-Tie Systems</h3>
      <p>Grid-tie solar systems are connected to the utility grid and allow you to sell excess electricity back to the power company through net metering. This is the most cost-effective option for homes and businesses with reliable grid access.</p>
      
      <h3>Hybrid Systems</h3>
      <p>Hybrid systems combine solar panels with battery storage and grid connection. They provide backup power during outages while still allowing you to benefit from net metering when the grid is available.</p>
      
      <h3>Off-Grid Systems</h3>
      <p>Off-grid systems are completely independent from the utility grid, making them perfect for remote locations, farms, and island properties. They require battery storage to provide power 24/7.</p>
      
      <h2>Permits and Requirements</h2>
      <p>Before installing solar panels in the Philippines, you'll need to obtain the necessary permits from your local government unit (LGU) and the Department of Energy (DOE). Your solar installer will typically handle this process for you.</p>
      
      <h2>ROI and Savings</h2>
      <p>Most solar panel systems in the Philippines pay for themselves within 4-6 years, with savings continuing for the system's 25-30 year lifespan. The exact ROI depends on your electricity consumption, system size, and local electricity rates.</p>
    `,
    author: "Sunterra Solar Team",
    publishDate: "2025-11-01",
    readTime: "8 min read",
    category: "Installation",
    tags: ["solar installation", "Philippines", "guide", "grid-tie"],
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 2,
    title: "How Net Metering Works in the Philippines: Save Money with Solar",
    slug: "net-metering-philippines-save-money-solar",
    excerpt:
      "Discover how net metering allows you to sell excess solar energy back to the grid, reducing your electricity bills and maximizing your solar investment.",
    content:
      "Net metering is a billing mechanism that credits solar energy system owners for the electricity they add to the grid. In the Philippines, this system allows homeowners and businesses to significantly reduce their electricity costs by generating their own power.",
    fullContent: `
      <h2>What is Net Metering?</h2>
      <p>Net metering is a billing mechanism that credits solar energy system owners for the electricity they add to the grid. In the Philippines, this system allows homeowners and businesses to significantly reduce their electricity costs by generating their own power.</p>
      
      <h2>How It Works</h2>
      <p>When your solar panels produce more electricity than you're using, the excess flows back to the grid and your meter runs backward. At the end of the billing period, you're only charged for your "net" energy consumption - the difference between what you used and what you produced.</p>
      
      <h2>Benefits of Net Metering</h2>
      <ul>
        <li>Reduce electricity bills by up to 90%</li>
        <li>Earn credits for excess energy production</li>
        <li>No need for battery storage</li>
        <li>Simple installation and maintenance</li>
      </ul>
      
      <h2>Requirements in the Philippines</h2>
      <p>To qualify for net metering in the Philippines, your system must be connected to the distribution utility's grid and meet certain technical requirements. Your solar installer will ensure your system is compliant.</p>
    `,
    author: "Sunterra Solar Team",
    publishDate: "2025-11-05",
    readTime: "6 min read",
    category: "Financial",
    tags: ["net metering", "savings", "grid-tie", "electricity"],
    image:
      "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 3,
    title: "Hybrid Solar Systems: The Best Solution for Unstable Power",
    slug: "hybrid-solar-systems-best-solution-unstable-power",
    excerpt:
      "Learn why hybrid solar systems with battery backup are perfect for areas with frequent power outages. Get uninterrupted power 24/7.",
    content:
      "Hybrid solar systems combine the best of both worlds: solar panels, battery storage, and grid connection. This makes them ideal for the Philippines, where power outages are common. With a hybrid system, you'll never be left in the dark.",
    fullContent: `
      <h2>What is a Hybrid Solar System?</h2>
      <p>Hybrid solar systems combine the best of both worlds: solar panels, battery storage, and grid connection. This makes them ideal for the Philippines, where power outages are common. With a hybrid system, you'll never be left in the dark.</p>
      
      <h2>How Hybrid Systems Work</h2>
      <p>During the day, your solar panels charge the batteries and power your home. Excess energy can be stored in batteries or sent to the grid. At night or during outages, the batteries provide power, ensuring uninterrupted electricity.</p>
      
      <h2>Benefits</h2>
      <ul>
        <li>24/7 power availability</li>
        <li>Backup during grid outages</li>
        <li>Can still benefit from net metering</li>
        <li>Energy independence</li>
      </ul>
    `,
    author: "Sunterra Solar Team",
    publishDate: "2025-11-10",
    readTime: "7 min read",
    category: "Technology",
    tags: ["hybrid solar", "battery backup", "power outages", "Philippines"],
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 4,
    title: "ROI Calculator: How Long Until Your Solar System Pays for Itself?",
    slug: "roi-calculator-solar-system-pays-itself",
    excerpt:
      "Calculate your solar panel ROI and discover how quickly your investment will pay for itself. Most systems pay for themselves in 4-6 years.",
    content:
      "Understanding your return on investment (ROI) is crucial when considering solar panels. This article breaks down the factors that affect ROI and provides a simple calculation method to determine when your system will pay for itself.",
    fullContent: `
      <h2>Understanding Solar ROI</h2>
      <p>Understanding your return on investment (ROI) is crucial when considering solar panels. This article breaks down the factors that affect ROI and provides a simple calculation method to determine when your system will pay for itself.</p>
      
      <h2>Factors Affecting ROI</h2>
      <ul>
        <li>System size and cost</li>
        <li>Your current electricity bill</li>
        <li>Local electricity rates</li>
        <li>Available incentives and rebates</li>
        <li>System efficiency and lifespan</li>
      </ul>
      
      <h2>Typical Payback Period</h2>
      <p>Most solar systems in the Philippines pay for themselves within 4-6 years. After that, you're essentially getting free electricity for the remaining 20+ years of the system's lifespan.</p>
    `,
    author: "Sunterra Solar Team",
    publishDate: "2025-11-15",
    readTime: "5 min read",
    category: "Financial",
    tags: ["ROI", "savings", "investment", "calculator"],
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 5,
    title:
      "Solar Panel Maintenance: Keep Your System Running at Peak Performance",
    slug: "solar-panel-maintenance-peak-performance",
    excerpt:
      "Learn essential maintenance tips to keep your solar panels operating efficiently for 25+ years. Simple steps to maximize your system's lifespan.",
    content:
      "Solar panels require minimal maintenance, but proper care ensures they operate at peak efficiency for their entire 25-30 year lifespan. This guide covers everything from cleaning schedules to monitoring your system's performance.",
    fullContent: `
      <h2>Maintenance Basics</h2>
      <p>Solar panels require minimal maintenance, but proper care ensures they operate at peak efficiency for their entire 25-30 year lifespan. This guide covers everything from cleaning schedules to monitoring your system's performance.</p>
      
      <h2>Regular Cleaning</h2>
      <p>In the Philippines, dust, bird droppings, and occasional typhoon debris can accumulate on panels. Clean panels every 3-6 months with water and a soft brush to maintain efficiency.</p>
      
      <h2>Monitoring Performance</h2>
      <p>Most modern systems include monitoring apps that let you track your system's performance. Watch for sudden drops in production, which could indicate a problem.</p>
      
      <h2>Professional Inspections</h2>
      <p>Schedule annual professional inspections to check connections, wiring, and overall system health. This helps catch issues early before they become costly problems.</p>
    `,
    author: "Sunterra Solar Team",
    publishDate: "2025-11-20",
    readTime: "6 min read",
    category: "Maintenance",
    tags: ["maintenance", "cleaning", "performance", "lifespan"],
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 6,
    title: "Off-Grid Solar: Complete Energy Independence for Remote Locations",
    slug: "off-grid-solar-complete-energy-independence",
    excerpt:
      "Discover how off-grid solar systems provide complete energy independence for remote properties, farms, and island locations in the Philippines.",
    content:
      "Off-grid solar systems are perfect for locations without access to the utility grid. These systems provide complete energy independence using solar panels and battery storage, making them ideal for remote properties, farms, and island locations throughout the Philippines.",
    fullContent: `
      <h2>What is Off-Grid Solar?</h2>
      <p>Off-grid solar systems are perfect for locations without access to the utility grid. These systems provide complete energy independence using solar panels and battery storage, making them ideal for remote properties, farms, and island locations throughout the Philippines.</p>
      
      <h2>System Components</h2>
      <ul>
        <li>Solar panels</li>
        <li>Battery bank for energy storage</li>
        <li>Charge controller</li>
        <li>Inverter</li>
        <li>Backup generator (optional)</li>
      </ul>
      
      <h2>Benefits</h2>
      <p>Complete energy independence, no monthly electricity bills, and the ability to power remote locations make off-grid systems an excellent choice for many properties in the Philippines.</p>
    `,
    author: "Sunterra Solar Team",
    publishDate: "2025-11-25",
    readTime: "7 min read",
    category: "Technology",
    tags: ["off-grid", "energy independence", "remote", "batteries"],
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop&auto=format",
  },
];
