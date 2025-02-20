// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const User = require('../models/User');
// const Client = require('../models/Client');
// const Campaign = require('../models/Campaign');
// const Analytics = require('../models/Analytics');

// dotenv.config();

// const generateRandomMetrics = () => ({
//   impressions: Math.floor(Math.random() * 100000),
//   clicks: Math.floor(Math.random() * 10000),
//   conversions: Math.floor(Math.random() * 1000),
//   spend: Math.floor(Math.random() * 5000),
//   roi: (Math.random() * 5).toFixed(2)
// });

// const platforms = ['Facebook', 'Google', 'Instagram', 'LinkedIn', 'Twitter'];

// const generatePlatformMetrics = () => 
//   platforms.map(name => ({
//     name,
//     metrics: {
//       impressions: Math.floor(Math.random() * 50000),
//       clicks: Math.floor(Math.random() * 5000),
//       spend: Math.floor(Math.random() * 2000)
//     }
//   }));

// async function generateMockData() {
//   try {
//     // await mongoose.connect(process.env.MONGODB_URI);
//     await mongoose.connect('mongodb://localhost:27017/marketpulse');
//     console.log('Connected to MongoDB');

//     // Create admin user
//     const admin = await User.create({
//       username: 'admin4',
//       email: 'admin4@admin.com',
//       password: 'admin123',
//       role: 'admin'

//     });

//     // Create clients
//     const clients = await Promise.all(
//       Array(10).fill().map(async (_, index) => {
//         return Client.Client.create({
//           name: `Client ${index + 1}`,
//           email: `client${index + 1}@example.com`,
//           company: `Company ${index + 1}`,
//           status: Math.random() > 0.2 ? 'active' : 'inactive',
//           metrics: {
//             totalSpend: Math.floor(Math.random() * 100000),
//             activeProjects: Math.floor(Math.random() * 5),
//             lastActivity: new Date()
//           },
//           assignedManager: admin._id
//         });
//       })
//     );

//     // Create campaigns
//     const campaigns = await Promise.all(
//       clients.flatMap(client => 
//         Array(Math.floor(Math.random() * 3) + 1).fill().map(async (_, index) => {
//           const startDate = new Date();
//           startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60));
          
//           return Campaign.Campaign.create({
//             name: `Campaign ${index + 1} for ${client.name}`,
//             client: client._id,
//             startDate,
//             endDate: new Date(startDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000),
//             budget: Math.floor(Math.random() * 50000),
//             status: ['draft', 'active', 'paused', 'completed'][Math.floor(Math.random() * 4)],
//             metrics: generateRandomMetrics(),
//             platforms: generatePlatformMetrics(),
//             createdBy: admin._id
//           });
//         })
//       )
//     );

//     // Create analytics data for the last 30 days
//     const analyticsData = await Promise.all(
//       Array(30).fill().map(async (_, index) => {
//         const date = new Date();
//         date.setDate(date.getDate() - index);
        
//         return Analytics.Analytics.create({
//           date,
//           metrics: {
//             dailySales: Math.floor(Math.random() * 10000),

//             newClients: Math.floor(Math.random() * 20),
//             activeUsers: Math.floor(Math.random() * 1000),
//             campaignPerformance: Math.floor(Math.random() * 100)
//           },
//           campaigns: campaigns.slice(0, Math.floor(Math.random() * 5)).map(campaign => ({
//             campaign: campaign._id,
//             metrics: generateRandomMetrics()
//           }))
//         });
//       })
//     );

//     console.log('Mock data generated successfully');
//     console.log(`Created:
//       - 1 Admin user
//       - ${clients.length} Clients
//       - ${campaigns.length} Campaigns
//       - ${analyticsData.length} Analytics entries`);

//   } catch (error) {
//     console.error('Error generating mock data:', error);
//   } finally {
//     await mongoose.disconnect();
//   }
// }

// generateMockData(); 