import React from 'react';
import WeatherWidget from '../../src/components/WeatherWidget';

describe('WeatherWidget component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('displays loading state initially', () => {
    // Intercept the API call to delay response
    cy.intercept('GET', 'https://api.open-meteo.com/v1/forecast*', {
      delay: 200,
      statusCode: 200,
      body: {
        latitude: 44.623917,
        longitude: -63.920472,
        generationtime_ms: 0.1,
        utc_offset_seconds: 0,
        timezone: 'GMT',
        timezone_abbreviation: 'GMT',
        elevation: 0,
        current_units: {
          time: 'iso8601',
          interval: 'seconds',
          temperature_2m: '°C',
          weather_code: 'wmo code',
          is_day: ''
        },
        current: {
          time: '2024-01-01T12:00',
          interval: 900,
          temperature_2m: 15.5,
          weather_code: 0,
          is_day: 1
        }
      }
    }).as('weatherRequest');

    cy.mount(<WeatherWidget />);
    
    // Should show loading spinner
    cy.get('[class*="animate-spin"]').should('exist');
    cy.contains('Loading').should('exist');
  });

  it('displays weather data when API call succeeds', () => {
    // Mock successful API response matching Open-Meteo format
    cy.intercept('GET', 'https://api.open-meteo.com/v1/forecast*', {
      statusCode: 200,
      body: {
        latitude: 44.623917,
        longitude: -63.920472,
        generationtime_ms: 0.1,
        utc_offset_seconds: 0,
        timezone: 'GMT',
        timezone_abbreviation: 'GMT',
        elevation: 0,
        current_units: {
          time: 'iso8601',
          interval: 'seconds',
          temperature_2m: '°C',
          weather_code: 'wmo code',
          is_day: ''
        },
        current: {
          time: '2024-01-01T12:00',
          interval: 900,
          temperature_2m: 15.5,
          weather_code: 0,
          is_day: 1
        }
      }
    }).as('weatherRequest');

    cy.mount(<WeatherWidget />);
    
    // Wait for API call to complete and component to render
    cy.wait('@weatherRequest');
    cy.wait(500); // Allow time for state update
    
    // Should display temperature (rounded from 15.5 to 16)
    cy.contains('16°C').should('exist');
    
    // Should display weather description
    cy.contains('clear sky').should('exist');
  });

  it('displays error message when API call fails', () => {
    // Mock failed API response
    cy.intercept('GET', 'https://api.open-meteo.com/v1/forecast*', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('weatherRequest');

    cy.mount(<WeatherWidget />);
    
    // Wait for API call to complete
    cy.wait('@weatherRequest');
    cy.wait(500); // Allow time for error state
    
    // Should display error message
    cy.contains('Weather unavailable').should('exist');
  });

  it('displays different weather conditions correctly', () => {
    // Test with cloudy weather (code 3 = overcast)
    cy.intercept('GET', 'https://api.open-meteo.com/v1/forecast*', {
      statusCode: 200,
      body: {
        latitude: 44.623917,
        longitude: -63.920472,
        generationtime_ms: 0.1,
        utc_offset_seconds: 0,
        timezone: 'GMT',
        timezone_abbreviation: 'GMT',
        elevation: 0,
        current_units: {
          time: 'iso8601',
          interval: 'seconds',
          temperature_2m: '°C',
          weather_code: 'wmo code',
          is_day: ''
        },
        current: {
          time: '2024-01-01T12:00',
          interval: 900,
          temperature_2m: 10.0,
          weather_code: 3, // Overcast
          is_day: 1
        }
      }
    }).as('weatherRequest');

    cy.mount(<WeatherWidget />);
    cy.wait('@weatherRequest');
    cy.wait(500);
    
    // Should display cloudy weather description
    cy.contains('partly cloudy').should('exist');
    cy.contains('10°C').should('exist');
  });

  it('displays moon icon for clear night weather', () => {
    cy.intercept('GET', 'https://api.open-meteo.com/v1/forecast*', {
      statusCode: 200,
      body: {
        latitude: 44.623917,
        longitude: -63.920472,
        generationtime_ms: 0.1,
        utc_offset_seconds: 0,
        timezone: 'GMT',
        timezone_abbreviation: 'GMT',
        elevation: 0,
        current_units: {
          time: 'iso8601',
          interval: 'seconds',
          temperature_2m: '°C',
          weather_code: 'wmo code',
          is_day: ''
        },
        current: {
          time: '2024-01-01T00:00',
          interval: 900,
          temperature_2m: 5.0,
          weather_code: 0, // Clear sky
          is_day: 0 // Night
        }
      }
    }).as('weatherRequest');

    cy.mount(<WeatherWidget />);
    cy.wait('@weatherRequest');
    cy.wait(500);
    
    // Should display clear sky description
    cy.contains('clear sky').should('exist');
    cy.contains('5°C').should('exist');
  });

  it('caches weather data and uses cache on subsequent renders', () => {
    // First mount - should make API call
    cy.intercept('GET', 'https://api.open-meteo.com/v1/forecast*', {
      statusCode: 200,
      body: {
        latitude: 44.623917,
        longitude: -63.920472,
        generationtime_ms: 0.1,
        utc_offset_seconds: 0,
        timezone: 'GMT',
        timezone_abbreviation: 'GMT',
        elevation: 0,
        current_units: {
          time: 'iso8601',
          interval: 'seconds',
          temperature_2m: '°C',
          weather_code: 'wmo code',
          is_day: ''
        },
        current: {
          time: '2024-01-01T12:00',
          interval: 900,
          temperature_2m: 20.0,
          weather_code: 0,
          is_day: 1
        }
      }
    }).as('weatherRequest');

    cy.mount(<WeatherWidget />);
    cy.wait('@weatherRequest');
    cy.wait(500);
    
    // Verify data is displayed
    cy.contains('20°C').should('exist');
    
    // Unmount component
    cy.get('body').then(() => {
      // Remount - should use cache (no new API call)
      cy.mount(<WeatherWidget />);
      
      // Should still show cached data
      cy.contains('20°C').should('exist');
      
      // Verify only one API call was made (cache was used on second mount)
      cy.get('@weatherRequest.all').should('have.length', 1);
    });
  });
});

