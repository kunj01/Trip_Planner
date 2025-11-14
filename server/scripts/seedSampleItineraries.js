import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Itinerary from '../models/Itinerary.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travel-advisor';

// Sample itineraries for world-famous places
const sampleItineraries = [
  {
    destination: 'Paris, France',
    title: 'Romantic Paris Getaway',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-05'),
    tripType: 'couple',
    budget: 'moderate',
    activityLevel: 'moderate',
    travelGroup: 'couple',
    interests: ['culture', 'food', 'photography'],
    itinerary: {
      destination: 'Paris, France',
      days: [
        {
          day: 1,
          title: 'Day 1: Arrival and Eiffel Tower',
          description: 'Welcome to the City of Light! Start your Parisian adventure.',
          activities: [
            {
              time: 'Morning',
              name: 'Eiffel Tower Visit',
              description: 'Visit the iconic Eiffel Tower and enjoy panoramic views of Paris',
              location: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris',
              cost: '₹2,075 - ₹4,150',
            },
            {
              time: 'Afternoon',
              name: 'Seine River Cruise',
              description: 'Take a scenic cruise along the Seine River',
              location: 'Seine River, Paris',
              cost: '₹1,245 - ₹2,490',
            },
            {
              time: 'Evening',
              name: 'Dinner at Le Marais',
              description: 'Enjoy authentic French cuisine in the historic Marais district',
              location: 'Le Marais, Paris',
              cost: '₹4,150 - ₹8,300',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Café de Flore', cuisine: 'French breakfast' },
            { type: 'Lunch', restaurant: 'Bistrot Paul Bert', cuisine: 'Traditional French' },
            { type: 'Dinner', restaurant: 'Le Comptoir du Relais', cuisine: 'French fine dining' },
          ],
          transportation: 'Metro and walking',
        },
        {
          day: 2,
          title: 'Day 2: Art and Culture',
          description: 'Explore world-renowned museums and art galleries.',
          activities: [
            {
              time: 'Morning',
              name: 'Louvre Museum',
              description: 'Discover the Mona Lisa and thousands of other masterpieces',
              location: 'Rue de Rivoli, 75001 Paris',
              cost: '₹1,660 - ₹2,490',
            },
            {
              time: 'Afternoon',
              name: 'Notre-Dame Cathedral',
              description: 'Visit the historic Notre-Dame Cathedral (exterior view)',
              location: '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris',
              cost: 'Free',
            },
            {
              time: 'Evening',
              name: 'Montmartre and Sacré-Cœur',
              description: 'Explore the artistic Montmartre district and visit Sacré-Cœur Basilica',
              location: 'Montmartre, 75018 Paris',
              cost: 'Free',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Angelina', cuisine: 'French pastries' },
            { type: 'Lunch', restaurant: 'Le Procope', cuisine: 'Historic French bistro' },
            { type: 'Dinner', restaurant: 'Le Train Bleu', cuisine: 'French cuisine' },
          ],
          transportation: 'Metro and walking',
        },
        {
          day: 3,
          title: 'Day 3: Versailles Day Trip',
          description: 'Visit the magnificent Palace of Versailles.',
          activities: [
            {
              time: 'Morning',
              name: 'Palace of Versailles',
              description: 'Tour the opulent Palace of Versailles and its gardens',
              location: 'Place d\'Armes, 78000 Versailles',
              cost: '₹2,490 - ₹4,150',
            },
            {
              time: 'Afternoon',
              name: 'Versailles Gardens',
              description: 'Stroll through the beautiful formal gardens',
              location: 'Versailles Gardens',
              cost: 'Free',
            },
            {
              time: 'Evening',
              name: 'Return to Paris',
              description: 'Return to Paris and enjoy evening in the Latin Quarter',
              location: 'Latin Quarter, Paris',
              cost: 'Free',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Hotel breakfast', cuisine: 'Continental' },
            { type: 'Lunch', restaurant: 'Restaurant in Versailles', cuisine: 'French' },
            { type: 'Dinner', restaurant: 'Le Comptoir', cuisine: 'French bistro' },
          ],
          transportation: 'Train and walking',
        },
        {
          day: 4,
          title: 'Day 4: Champs-Élysées and Shopping',
          description: 'Shop on the famous Champs-Élysées and explore more of Paris.',
          activities: [
            {
              time: 'Morning',
              name: 'Arc de Triomphe',
              description: 'Climb to the top of the Arc de Triomphe for stunning views',
              location: 'Place Charles de Gaulle, 75008 Paris',
              cost: '₹1,245 - ₹2,075',
            },
            {
              time: 'Afternoon',
              name: 'Champs-Élysées Shopping',
              description: 'Shop along the famous Champs-Élysées avenue',
              location: 'Champs-Élysées, 75008 Paris',
              cost: 'Varies',
            },
            {
              time: 'Evening',
              name: 'Moulin Rouge Show',
              description: 'Experience the world-famous Moulin Rouge cabaret show',
              location: '82 Boulevard de Clichy, 75018 Paris',
              cost: '₹8,300 - ₹16,600',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Ladurée', cuisine: 'French pastries' },
            { type: 'Lunch', restaurant: 'Fouquet\'s', cuisine: 'French brasserie' },
            { type: 'Dinner', restaurant: 'Le Jules Verne', cuisine: 'Fine dining' },
          ],
          transportation: 'Metro and walking',
        },
      ],
      totalCost: '₹2,07,500',
      tips: [
        'Purchase a Paris Museum Pass for discounts',
        'Learn basic French phrases',
        'Book restaurant reservations in advance',
        'Wear comfortable walking shoes',
      ],
    },
    selectedRecommendations: [],
    isSample: true,
  },
  {
    destination: 'Tokyo, Japan',
    title: 'Tokyo Adventure: Modern Meets Traditional',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-07-06'),
    tripType: 'solo',
    budget: 'moderate',
    activityLevel: 'active',
    travelGroup: 'solo',
    interests: ['culture', 'food', 'adventure'],
    itinerary: {
      destination: 'Tokyo, Japan',
      days: [
        {
          day: 1,
          title: 'Day 1: Arrival and Shibuya',
          description: 'Welcome to Tokyo! Experience the famous Shibuya crossing.',
          activities: [
            {
              time: 'Morning',
              name: 'Shibuya Crossing',
              description: 'Witness the world\'s busiest pedestrian crossing',
              location: 'Shibuya City, Tokyo',
              cost: 'Free',
            },
            {
              time: 'Afternoon',
              name: 'Harajuku District',
              description: 'Explore the vibrant Harajuku fashion district',
              location: 'Harajuku, Shibuya City, Tokyo',
              cost: 'Free',
            },
            {
              time: 'Evening',
              name: 'Shibuya Sky',
              description: 'Enjoy panoramic views from Shibuya Sky observation deck',
              location: 'Shibuya Scramble Square, Tokyo',
              cost: '₹1,660 - ₹2,490',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Convenience store', cuisine: 'Japanese breakfast' },
            { type: 'Lunch', restaurant: 'Ichiran Ramen', cuisine: 'Tonkotsu ramen' },
            { type: 'Dinner', restaurant: 'Sushi restaurant', cuisine: 'Fresh sushi' },
          ],
          transportation: 'JR Pass and walking',
        },
        {
          day: 2,
          title: 'Day 2: Traditional Tokyo',
          description: 'Explore traditional temples and gardens.',
          activities: [
            {
              time: 'Morning',
              name: 'Senso-ji Temple',
              description: 'Visit Tokyo\'s oldest temple in Asakusa',
              location: '2 Chome-3-1 Asakusa, Taito City, Tokyo',
              cost: 'Free',
            },
            {
              time: 'Afternoon',
              name: 'Ueno Park',
              description: 'Stroll through Ueno Park and visit museums',
              location: 'Ueno Park, Taito City, Tokyo',
              cost: 'Free',
            },
            {
              time: 'Evening',
              name: 'Tokyo Skytree',
              description: 'Visit the tallest tower in Japan',
              location: '1 Chome-1-2 Oshiage, Sumida City, Tokyo',
              cost: '₹2,075 - ₹2,905',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Traditional ryokan', cuisine: 'Japanese breakfast' },
            { type: 'Lunch', restaurant: 'Ueno market', cuisine: 'Street food' },
            { type: 'Dinner', restaurant: 'Izakaya', cuisine: 'Japanese pub food' },
          ],
          transportation: 'Metro and walking',
        },
        {
          day: 3,
          title: 'Day 3: Modern Tokyo',
          description: 'Experience cutting-edge technology and pop culture.',
          activities: [
            {
              time: 'Morning',
              name: 'Tsukiji Outer Market',
              description: 'Explore the famous fish market (outer market)',
              location: 'Tsukiji, Chuo City, Tokyo',
              cost: 'Free',
            },
            {
              time: 'Afternoon',
              name: 'Ginza District',
              description: 'Shop in Tokyo\'s luxury shopping district',
              location: 'Ginza, Chuo City, Tokyo',
              cost: 'Varies',
            },
            {
              time: 'Evening',
              name: 'Robot Restaurant Show',
              description: 'Experience the unique robot restaurant show',
              location: 'Shinjuku, Tokyo',
              cost: '₹4,150 - ₹6,640',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Tsukiji market', cuisine: 'Fresh sushi' },
            { type: 'Lunch', restaurant: 'Ginza restaurant', cuisine: 'Japanese fine dining' },
            { type: 'Dinner', restaurant: 'Yakiniku restaurant', cuisine: 'Japanese BBQ' },
          ],
          transportation: 'Metro and walking',
        },
        {
          day: 4,
          title: 'Day 4: Day Trip to Mount Fuji',
          description: 'Take a day trip to see the iconic Mount Fuji.',
          activities: [
            {
              time: 'Morning',
              name: 'Travel to Hakone',
              description: 'Take the Shinkansen to Hakone for Mount Fuji views',
              location: 'Hakone, Kanagawa',
              cost: '₹4,150 - ₹6,640',
            },
            {
              time: 'Afternoon',
              name: 'Lake Ashi Cruise',
              description: 'Cruise on Lake Ashi with Mount Fuji views',
              location: 'Lake Ashi, Hakone',
              cost: '₹1,660 - ₹2,490',
            },
            {
              time: 'Evening',
              name: 'Onsen Experience',
              description: 'Relax in a traditional Japanese hot spring',
              location: 'Hakone onsen',
              cost: '₹2,490 - ₹4,150',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Hotel', cuisine: 'Japanese breakfast' },
            { type: 'Lunch', restaurant: 'Hakone restaurant', cuisine: 'Kaiseki' },
            { type: 'Dinner', restaurant: 'Onsen ryokan', cuisine: 'Traditional Japanese' },
          ],
          transportation: 'Shinkansen and local transport',
        },
      ],
      totalCost: '₹2,32,400',
      tips: [
        'Get a JR Pass for unlimited train travel',
        'Learn basic Japanese phrases',
        'Carry cash as many places don\'t accept cards',
        'Respect temple etiquette',
      ],
    },
    selectedRecommendations: [],
    isSample: true,
  },
  {
    destination: 'New York City, USA',
    title: 'NYC: The City That Never Sleeps',
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-08-05'),
    tripType: 'friends',
    budget: 'moderate',
    activityLevel: 'active',
    travelGroup: 'friends',
    interests: ['culture', 'nightlife', 'shopping'],
    itinerary: {
      destination: 'New York City, USA',
      days: [
        {
          day: 1,
          title: 'Day 1: Manhattan Arrival',
          description: 'Welcome to the Big Apple! Start with iconic landmarks.',
          activities: [
            {
              time: 'Morning',
              name: 'Times Square',
              description: 'Experience the energy of Times Square',
              location: 'Times Square, Manhattan, NYC',
              cost: 'Free',
            },
            {
              time: 'Afternoon',
              name: 'Empire State Building',
              description: 'Visit the iconic Empire State Building observation deck',
              location: '350 5th Ave, New York, NY',
              cost: '₹3,320 - ₹4,980',
            },
            {
              time: 'Evening',
              name: 'Broadway Show',
              description: 'Watch a world-class Broadway musical',
              location: 'Broadway, Manhattan',
              cost: '₹8,300 - ₹16,600',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Deli', cuisine: 'NYC bagels' },
            { type: 'Lunch', restaurant: 'Pizza place', cuisine: 'NYC pizza' },
            { type: 'Dinner', restaurant: 'Steakhouse', cuisine: 'American steak' },
          ],
          transportation: 'Subway and walking',
        },
        {
          day: 2,
          title: 'Day 2: Central Park and Museums',
          description: 'Explore Central Park and world-class museums.',
          activities: [
            {
              time: 'Morning',
              name: 'Central Park',
              description: 'Stroll through the famous Central Park',
              location: 'Central Park, Manhattan',
              cost: 'Free',
            },
            {
              time: 'Afternoon',
              name: 'Metropolitan Museum of Art',
              description: 'Explore one of the world\'s largest art museums',
              location: '1000 5th Ave, New York, NY',
              cost: '$25 - $30',
            },
            {
              time: 'Evening',
              name: 'Brooklyn Bridge',
              description: 'Walk across the historic Brooklyn Bridge at sunset',
              location: 'Brooklyn Bridge, NYC',
              cost: 'Free',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Café', cuisine: 'American breakfast' },
            { type: 'Lunch', restaurant: 'Museum café', cuisine: 'American' },
            { type: 'Dinner', restaurant: 'Brooklyn restaurant', cuisine: 'International' },
          ],
          transportation: 'Subway and walking',
        },
        {
          day: 3,
          title: 'Day 3: Statue of Liberty and Financial District',
          description: 'Visit the Statue of Liberty and explore downtown.',
          activities: [
            {
              time: 'Morning',
              name: 'Statue of Liberty',
              description: 'Take a ferry to see the Statue of Liberty',
              location: 'Liberty Island, NYC',
              cost: '$25 - $30',
            },
            {
              time: 'Afternoon',
              name: '9/11 Memorial',
              description: 'Visit the 9/11 Memorial and Museum',
              location: '180 Greenwich St, New York, NY',
              cost: '$25 - $30',
            },
            {
              time: 'Evening',
              name: 'One World Trade Center',
              description: 'Visit the observation deck at One World Trade Center',
              location: '285 Fulton St, New York, NY',
              cost: '₹2,905 - ₹3,735',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Diner', cuisine: 'American breakfast' },
            { type: 'Lunch', restaurant: 'Financial District', cuisine: 'American' },
            { type: 'Dinner', restaurant: 'Little Italy', cuisine: 'Italian' },
          ],
          transportation: 'Ferry and subway',
        },
        {
          day: 4,
          title: 'Day 4: Shopping and Nightlife',
          description: 'Shop on Fifth Avenue and experience NYC nightlife.',
          activities: [
            {
              time: 'Morning',
              name: 'Fifth Avenue Shopping',
              description: 'Shop on the famous Fifth Avenue',
              location: 'Fifth Avenue, Manhattan',
              cost: 'Varies',
            },
            {
              time: 'Afternoon',
              name: 'High Line Park',
              description: 'Walk the elevated High Line park',
              location: 'High Line, Manhattan',
              cost: 'Free',
            },
            {
              time: 'Evening',
              name: 'Rooftop Bar',
              description: 'Enjoy drinks with a view at a rooftop bar',
              location: 'Manhattan rooftop bars',
              cost: '₹2,490 - ₹4,980',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Brunch spot', cuisine: 'American brunch' },
            { type: 'Lunch', restaurant: 'Chelsea Market', cuisine: 'Various cuisines' },
            { type: 'Dinner', restaurant: 'Rooftop restaurant', cuisine: 'American' },
          ],
          transportation: 'Subway and walking',
        },
      ],
      totalCost: '₹1,82,600',
      tips: [
        'Get a MetroCard for unlimited subway rides',
        'Book Broadway tickets in advance',
        'Wear comfortable walking shoes',
        'Tipping is expected (15-20%)',
      ],
    },
    selectedRecommendations: [],
    isSample: true,
  },
  {
    destination: 'Rome, Italy',
    title: 'Eternal City: Ancient History and Italian Cuisine',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-09-05'),
    tripType: 'family',
    budget: 'moderate',
    activityLevel: 'moderate',
    travelGroup: 'family',
    interests: ['culture', 'food', 'history'],
    itinerary: {
      destination: 'Rome, Italy',
      days: [
        {
          day: 1,
          title: 'Day 1: Ancient Rome',
          description: 'Explore the ancient ruins of the Roman Empire.',
          activities: [
            {
              time: 'Morning',
              name: 'Colosseum',
              description: 'Visit the iconic Colosseum, symbol of ancient Rome',
              location: 'Piazza del Colosseo, 1, 00184 Roma RM, Italy',
              cost: '₹1,660 - ₹2,490',
            },
            {
              time: 'Afternoon',
              name: 'Roman Forum',
              description: 'Walk through the ancient Roman Forum',
              location: 'Via della Salara Vecchia, 5/6, 00186 Roma RM, Italy',
              cost: 'Included with Colosseum',
            },
            {
              time: 'Evening',
              name: 'Trevi Fountain',
              description: 'Visit the beautiful Trevi Fountain and throw a coin',
              location: 'Piazza di Trevi, 00187 Roma RM, Italy',
              cost: 'Free',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Café', cuisine: 'Italian breakfast' },
            { type: 'Lunch', restaurant: 'Trattoria', cuisine: 'Roman cuisine' },
            { type: 'Dinner', restaurant: 'Ristorante', cuisine: 'Italian fine dining' },
          ],
          transportation: 'Walking and metro',
        },
        {
          day: 2,
          title: 'Day 2: Vatican City',
          description: 'Visit the smallest country in the world and its treasures.',
          activities: [
            {
              time: 'Morning',
              name: 'Vatican Museums',
              description: 'Explore the Vatican Museums and Sistine Chapel',
              location: '00120 Vatican City',
              cost: '₹2,075 - ₹2,905',
            },
            {
              time: 'Afternoon',
              name: 'St. Peter\'s Basilica',
              description: 'Visit the largest church in the world',
              location: 'Piazza San Pietro, 00120 Città del Vaticano',
              cost: 'Free',
            },
            {
              time: 'Evening',
              name: 'Castel Sant\'Angelo',
              description: 'Visit the historic Castel Sant\'Angelo',
              location: 'Lungotevere Castello, 50, 00193 Roma RM, Italy',
              cost: '$15 - $20',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Hotel', cuisine: 'Continental' },
            { type: 'Lunch', restaurant: 'Vatican area', cuisine: 'Italian' },
            { type: 'Dinner', restaurant: 'Trastevere', cuisine: 'Roman cuisine' },
          ],
          transportation: 'Walking and metro',
        },
        {
          day: 3,
          title: 'Day 3: Historic Center',
          description: 'Explore Rome\'s historic center and piazzas.',
          activities: [
            {
              time: 'Morning',
              name: 'Pantheon',
              description: 'Visit the ancient Pantheon temple',
              location: 'Piazza della Rotonda, 00186 Roma RM, Italy',
              cost: 'Free',
            },
            {
              time: 'Afternoon',
              name: 'Piazza Navona',
              description: 'Stroll through the beautiful Piazza Navona',
              location: 'Piazza Navona, 00186 Roma RM, Italy',
              cost: 'Free',
            },
            {
              time: 'Evening',
              name: 'Spanish Steps',
              description: 'Visit the famous Spanish Steps',
              location: 'Piazza di Spagna, 00187 Roma RM, Italy',
              cost: 'Free',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Café', cuisine: 'Italian pastries' },
            { type: 'Lunch', restaurant: 'Gelateria', cuisine: 'Gelato' },
            { type: 'Dinner', restaurant: 'Osteria', cuisine: 'Traditional Italian' },
          ],
          transportation: 'Walking',
        },
        {
          day: 4,
          title: 'Day 4: Day Trip to Tivoli',
          description: 'Take a day trip to the beautiful Villa d\'Este.',
          activities: [
            {
              time: 'Morning',
              name: 'Travel to Tivoli',
              description: 'Take a train to Tivoli',
              location: 'Tivoli, Lazio',
              cost: '₹830 - ₹1,245',
            },
            {
              time: 'Afternoon',
              name: 'Villa d\'Este',
              description: 'Visit the stunning Villa d\'Este with its fountains',
              location: 'Piazza Trento, 5, 00019 Tivoli RM, Italy',
              cost: '$15 - $20',
            },
            {
              time: 'Evening',
              name: 'Return to Rome',
              description: 'Return to Rome for final evening',
              location: 'Rome',
              cost: '₹830 - ₹1,245',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Hotel', cuisine: 'Continental' },
            { type: 'Lunch', restaurant: 'Tivoli restaurant', cuisine: 'Italian' },
            { type: 'Dinner', restaurant: 'Roman trattoria', cuisine: 'Roman specialties' },
          ],
          transportation: 'Train and walking',
        },
      ],
      totalCost: '₹1,66,000',
      tips: [
        'Book Vatican tickets in advance',
        'Wear comfortable shoes for walking',
        'Learn basic Italian phrases',
        'Try authentic gelato',
      ],
    },
    selectedRecommendations: [],
    isSample: true,
  },
  {
    destination: 'Bali, Indonesia',
    title: 'Tropical Paradise: Beaches and Temples',
    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-10-06'),
    tripType: 'couple',
    budget: 'moderate',
    activityLevel: 'relaxed',
    travelGroup: 'couple',
    interests: ['nature', 'relaxation', 'culture'],
    itinerary: {
      destination: 'Bali, Indonesia',
      days: [
        {
          day: 1,
          title: 'Day 1: Arrival and Ubud',
          description: 'Welcome to the Island of Gods! Start in cultural Ubud.',
          activities: [
            {
              time: 'Morning',
              name: 'Tegalalang Rice Terraces',
              description: 'Visit the famous Tegalalang Rice Terraces',
              location: 'Tegalalang, Gianyar, Bali',
              cost: '₹415 - ₹830',
            },
            {
              time: 'Afternoon',
              name: 'Ubud Monkey Forest',
              description: 'Explore the sacred monkey forest',
              location: 'Jalan Monkey Forest, Ubud',
              cost: '₹415 - ₹830',
            },
            {
              time: 'Evening',
              name: 'Ubud Market',
              description: 'Shop for local crafts and souvenirs',
              location: 'Ubud Market, Ubud',
              cost: 'Varies',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Hotel', cuisine: 'Indonesian breakfast' },
            { type: 'Lunch', restaurant: 'Warung', cuisine: 'Balinese cuisine' },
            { type: 'Dinner', restaurant: 'Ubud restaurant', cuisine: 'Indonesian' },
          ],
          transportation: 'Private driver',
        },
        {
          day: 2,
          title: 'Day 2: Temples and Waterfalls',
          description: 'Visit ancient temples and beautiful waterfalls.',
          activities: [
            {
              time: 'Morning',
              name: 'Tirta Empul Temple',
              description: 'Visit the holy water temple',
              location: 'Tirta Empul, Tampaksiring, Gianyar',
              cost: '₹415 - ₹830',
            },
            {
              time: 'Afternoon',
              name: 'Tegenungan Waterfall',
              description: 'Swim at the beautiful Tegenungan Waterfall',
              location: 'Tegenungan, Kemenuh, Gianyar',
              cost: '₹249 - ₹415',
            },
            {
              time: 'Evening',
              name: 'Traditional Balinese Dance',
              description: 'Watch a traditional Balinese dance performance',
              location: 'Ubud Palace',
              cost: '₹830 - ₹1,245',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Hotel', cuisine: 'Indonesian' },
            { type: 'Lunch', restaurant: 'Waterfall café', cuisine: 'Indonesian' },
            { type: 'Dinner', restaurant: 'Ubud restaurant', cuisine: 'Balinese' },
          ],
          transportation: 'Private driver',
        },
        {
          day: 3,
          title: 'Day 3: Beach Time in Seminyak',
          description: 'Relax on beautiful beaches and enjoy beach clubs.',
          activities: [
            {
              time: 'Morning',
              name: 'Seminyak Beach',
              description: 'Relax on the beautiful Seminyak Beach',
              location: 'Seminyak Beach, Bali',
              cost: 'Free',
            },
            {
              time: 'Afternoon',
              name: 'Beach Club',
              description: 'Enjoy drinks and food at a beach club',
              location: 'Seminyak beach clubs',
              cost: '₹2,490 - ₹4,980',
            },
            {
              time: 'Evening',
              name: 'Sunset at Tanah Lot',
              description: 'Watch sunset at the iconic Tanah Lot Temple',
              location: 'Tanah Lot, Tabanan, Bali',
              cost: '₹415 - ₹830',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Hotel', cuisine: 'Continental' },
            { type: 'Lunch', restaurant: 'Beach club', cuisine: 'International' },
            { type: 'Dinner', restaurant: 'Seafood restaurant', cuisine: 'Fresh seafood' },
          ],
          transportation: 'Private driver',
        },
        {
          day: 4,
          title: 'Day 4: Water Sports and Spa',
          description: 'Enjoy water sports and relax with a spa treatment.',
          activities: [
            {
              time: 'Morning',
              name: 'Water Sports',
              description: 'Try snorkeling or diving in crystal clear waters',
              location: 'Nusa Dua or Sanur',
              cost: '₹4,150 - ₹8,300',
            },
            {
              time: 'Afternoon',
              name: 'Spa Treatment',
              description: 'Relax with a traditional Balinese spa treatment',
              location: 'Ubud or Seminyak spa',
              cost: '₹3,320 - ₹6,640',
            },
            {
              time: 'Evening',
              name: 'Beach Dinner',
              description: 'Enjoy a romantic beachfront dinner',
              location: 'Beachfront restaurant',
              cost: '₹4,150 - ₹8,300',
            },
          ],
          meals: [
            { type: 'Breakfast', restaurant: 'Hotel', cuisine: 'Indonesian' },
            { type: 'Lunch', restaurant: 'Beach restaurant', cuisine: 'International' },
            { type: 'Dinner', restaurant: 'Beachfront restaurant', cuisine: 'Seafood' },
          ],
          transportation: 'Private driver',
        },
      ],
      totalCost: '₹1,49,400',
      tips: [
        'Hire a private driver for convenience',
        'Respect temple dress codes',
        'Bargain at markets',
        'Stay hydrated in the heat',
      ],
    },
    selectedRecommendations: [],
    isSample: true,
  },
];

async function seedSampleItineraries() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing sample itineraries
    await Itinerary.deleteMany({ isSample: true });
    console.log('Cleared existing sample itineraries');

    // Insert sample itineraries
    const inserted = await Itinerary.insertMany(sampleItineraries);
    console.log(`Successfully seeded ${inserted.length} sample itineraries`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding sample itineraries:', error);
    process.exit(1);
  }
}

// Run the seed function
seedSampleItineraries();

