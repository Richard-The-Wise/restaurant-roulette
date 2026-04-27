import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Restaurant Roulette",
    short_name: "Roulette",
    description: "Guarda restaurantes, organiza listas y gira una ruleta elegante para decidir tu siguiente cita.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#14b8a6",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  };
}
