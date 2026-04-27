const express = require('express');
const axios   = require('axios');
const router  = express.Router();

// Mock fallback w przypadku braku klucza
const MOCK_WEATHER = {
  Warsaw: { temp: 18, feels_like: 16, description: 'Częściowe zachmurzenie', icon: '02d', humidity: 65, wind_speed: 3.5 },
};

// ── GET /api/weather?city=Warsaw ────────────────────────────────
router.get('/', async (req, res) => {
  const city = req.query.city || 'Warsaw';
  const apiKey = process.env.WEATHER_API_KEY;

  if (apiKey && apiKey !== 'mock') {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pl`);
      const data = response.data;
      
      const weather = {
        city: data.name,
        country: data.sys.country,
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed
      };

      weather.playable = weather.temp > 5 && weather.wind_speed < 10 && !weather.description.toLowerCase().includes('deszcz');

      return res.json({ ...weather, isMock: false });
    } catch (err) {
      console.error('Błąd pobierania pogody z API:', err.message);
      // Fallback do mocka
    }
  }

  // --- MOCK FALLBACK ---
  const base = MOCK_WEATHER[city];
  const weather = base
    ? { ...base, city, country: 'PL' }
    : {
        city,
        country:     'PL',
        temp:        Math.floor(Math.random() * 10) + 12,
        feels_like:  Math.floor(Math.random() * 10) + 10,
        description: 'Czyste niebo',
        icon:        '01d',
        humidity:    60,
        wind_speed:  2.5,
      };

  weather.playable = weather.temp > 5 && weather.wind_speed < 10 && !weather.description.toLowerCase().includes('deszcz');

  res.json({
    ...weather,
    isMock: true,
    hint: 'Zwrócono dane testowe. Sprawdź klucz WEATHER_API_KEY',
  });
});

module.exports = router;
