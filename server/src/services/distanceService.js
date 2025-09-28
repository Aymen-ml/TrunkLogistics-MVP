import axios from 'axios';
import logger from '../utils/logger.js';

class DistanceService {
  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.fallbackDistancePerDegree = 111; // Approximate km per degree of latitude/longitude
  }

  /**
   * Calculate distance between two cities using Google Maps Distance Matrix API
   * @param {string} origin - Origin city
   * @param {string} destination - Destination city
   * @returns {Promise<{distance: number, duration: number}>} Distance in km and duration in minutes
   */
  async calculateDistance(origin, destination) {
    try {
      if (this.googleMapsApiKey) {
        return await this.calculateWithGoogleMaps(origin, destination);
      } else {
        logger.warn('Google Maps API key not configured, using fallback calculation');
        return await this.calculateFallbackDistance(origin, destination);
      }
    } catch (error) {
      logger.error('Distance calculation error:', error);
      // Fallback to approximate calculation
      return await this.calculateFallbackDistance(origin, destination);
    }
  }

  /**
   * Calculate distance using Google Maps Distance Matrix API
   */
  async calculateWithGoogleMaps(origin, destination) {
    const url = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    const params = {
      origins: origin,
      destinations: destination,
      units: 'metric',
      key: this.googleMapsApiKey
    };

    const response = await axios.get(url, { 
      params,
      timeout: 5000 // 5 second timeout
    });
    
    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }

    const element = response.data.rows[0]?.elements[0];
    
    if (!element || element.status !== 'OK') {
      throw new Error(`Route not found between ${origin} and ${destination}`);
    }

    return {
      distance: Math.round(element.distance.value / 1000), // Convert meters to km
      duration: Math.round(element.duration.value / 60), // Convert seconds to minutes
      route: `${origin} → ${destination}`
    };
  }

  /**
   * Fallback distance calculation using approximate coordinates
   * This is a simplified calculation for demonstration purposes
   */
  async calculateFallbackDistance(origin, destination) {
    // In a real implementation, you would use a geocoding service or database
    // For now, we'll use a simple estimation based on city names
    const distance = await this.estimateDistanceByCity(origin, destination);
    
    return {
      distance,
      duration: Math.round(distance * 1.5), // Rough estimate: 1.5 minutes per km
      route: `${origin} → ${destination}`,
      estimated: true
    };
  }

  /**
   * Simple distance estimation based on city names
   * In production, this should use actual coordinates
   */
  async estimateDistanceByCity(origin, destination) {
    // Normalize city names
    const normalizeCity = (city) => city.toLowerCase().trim();
    const originNorm = normalizeCity(origin);
    const destNorm = normalizeCity(destination);

    // Same city
    if (originNorm === destNorm) {
      return 25; // Assume 25km for same city transport
    }

    // Simple distance matrix for common cities (for demo purposes)
    const cityDistances = {
      'casablanca-rabat': 90,
      'casablanca-marrakech': 240,
      'casablanca-fez': 300,
      'rabat-marrakech': 330,
      'rabat-fez': 210,
      'marrakech-fez': 530,
      'casablanca-agadir': 500,
      'rabat-agadir': 590,
      'marrakech-agadir': 260,
      'fez-agadir': 790
    };

    // Create lookup key
    const key1 = `${originNorm}-${destNorm}`;
    const key2 = `${destNorm}-${originNorm}`;

    if (cityDistances[key1]) {
      return cityDistances[key1];
    }
    if (cityDistances[key2]) {
      return cityDistances[key2];
    }

    // Default estimation for unknown routes
    return 200; // Default 200km for unknown city pairs
  }

  /**
   * Calculate booking price based on truck pricing and distance
   * @param {Object} truck - Truck object with pricing information
   * @param {number} distance - Distance in kilometers
   * @returns {number} Calculated price
   */
  calculatePrice(truck, distance) {
    if (truck.pricing_type === 'per_km') {
      return Math.round(truck.price_per_km * distance * 100) / 100; // Round to 2 decimal places
    } else if (truck.pricing_type === 'fixed') {
      return truck.fixed_price;
    } else {
      throw new Error('Invalid pricing type');
    }
  }

  /**
   * Get price estimate for a route with a specific truck
   * @param {Object} truck - Truck object
   * @param {string} origin - Origin city
   * @param {string} destination - Destination city
   * @returns {Promise<Object>} Price estimate with distance and route info
   */
  async getPriceEstimate(truck, origin, destination) {
    const distanceInfo = await this.calculateDistance(origin, destination);
    const price = this.calculatePrice(truck, distanceInfo.distance);

    return {
      ...distanceInfo,
      price,
      priceBreakdown: {
        pricingType: truck.pricing_type,
        rate: truck.pricing_type === 'per_km' ? truck.price_per_km : truck.fixed_price,
        distance: distanceInfo.distance,
        calculation: truck.pricing_type === 'per_km' 
          ? `${truck.price_per_km}/km × ${distanceInfo.distance}km = $${price}`
          : `Fixed price: $${price}`
      }
    };
  }
}

export default new DistanceService();
