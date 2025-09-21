// FILE: src/hooks/useExchangeRates.js
import { useState, useEffect } from 'react';

const API_KEY = '923ce20ccb7e5266bd2849c4'; // Replace with your key
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/GBP`;

export function useExchangeRates() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRates() {
      try {
        setLoading(true);
        const response = await fetch(BASE_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates');
        }
        const data = await response.json();
        if (data.result === 'success') {
          setRates(data.conversion_rates);
        } else {
          throw new Error('API returned an error: ' + data['error-type']);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRates();
  }, []);

  return { rates, loading, error };
}