const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const ALL_ROLES = ["Customer Success","Customer Support","SDR","BDR","Account Executive","Sales Representative","Inside Sales","Community Manager","Social Media Manager","Content Creator","Copywriter","Email Marketing","Marketing Digital","Growth Hacker","SEO Specialist","Paid Media","Performance Marketing","Project Manager","Scrum Master","Product Manager","Product Owner","UX/UI Designer","Graphic Designer","Video Editor","Motion Designer","Data Analyst","Business Analyst","Data Entry","HR Recruiter","Talent Acquisition","Executive Assistant","Virtual Assistant","Operations Manager","Account Manager","Partnerships Manager","E-commerce Manager","Tech Support","QA Tester","Front-end Developer","Back-end Developer","Full Stack Developer","Customer Experience"];

app.post('/analyze', async (req, res) => {
  const { experience } = req.body;
  if (!experience || experience.trim().length < 10) {
    return res.status(400).json({ error: 'Experiencia muy corta' });
  }

  const prompt = `Eres un experto en LinkedIn, trabajo remoto y personal branding. Analiza esta experiencia y devuelve SOLO un JSON sin markdown ni backticks con esta estructura exacta:
{
  "nombre_perfil": "título profesional corto",
  "resumen_corto": "1 oración que describa el perfil para trabajo remoto",
  "score": número 1-100 basado SOLO en la experiencia real descrita,
  "score_label": "etiqueta motivadora corta",
  "roles_top": ["4 roles remotos mejor fit de esta lista SEGÚN LA EXPERIENCIA REAL: ${ALL_ROLES.join(',')}"],
  "roles_mid": ["3 roles con potencial de esta lista SEGÚN LA EXPERIENCIA REAL"],
  "roles_low": ["2 roles para explorar de esta lista SEGÚN LA EXPERIENCIA REAL"],
  "headline": "Headline de LinkedIn potente, máx 220 chars, mezcla español e inglés con keywords remotas",
  "acerca_de": "Texto completo para la sección Acerca de de LinkedIn. 4-5 párrafos en primera persona, con emojis estratégicos, orientado a trabajo remoto, con keywords. Incluye: quién sos, qué hacés, logros, qué buscás y CTA final.",
  "experiencia_tips": "2-3 oraciones con consejos concretos para optimizar la sección de experiencia de LinkedIn según este perfil específico",
  "skills": ["15 skills relevantes para trabajo remoto y el perfil analizado, mezcla español e inglés"]
}

IMPORTANTE: El análisis debe ser 100% personalizado a la experiencia descrita. Si alguien trabajó en limpieza, sus roles deben reflejar eso (ej: Virtual Assistant, Housekeeping Coordinator, Property Manager remoto, etc). NUNCA uses datos genéricos.

Experiencia: ${experience.substring(0, 3000)}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    let raw = data.content.map(i => i.text || '').join('').replace(/```json|```/g, '').trim();
    const result = JSON.parse(raw);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al analizar el perfil' });
  }
});

app.get('/', (req, res) => res.send('Rovexa API OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
