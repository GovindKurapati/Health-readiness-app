export const fetchHealthcare = async (lat, lon) => {
    const res = await fetch('http://localhost:8000/healthcare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude: lat, longitude: lon }),
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  };