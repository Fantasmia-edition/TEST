import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import Replicate from 'replicate';
import fetch from 'node-fetch';

config();

const app = express();
app.use(cors());
app.use(express.json());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Le prompt est obligatoire.' });
    }

    const output = await replicate.run('black-forest-labs/flux-dev', {
      input: {
        prompt,
        guidance: 3.5,
      },
    });

    const imageUrl = output[0];
    // Télécharger l'image depuis l'URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Erreur lors du téléchargement de l'image: ${response.statusText}`);
    }
    const buffer = await response.buffer();
    const base64Image = buffer.toString('base64');

    // Renvoyer l'image encodée en base64
    res.json({ imageBase64: `data:image/webp;base64,${base64Image}` });

  } catch (error) {
    console.error("Erreur lors de la génération de l'image :", error);
    res.status(500).json({ error: 'Erreur lors de la génération de l’image' });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ Serveur backend lancé sur http://localhost:${PORT}`);
});
