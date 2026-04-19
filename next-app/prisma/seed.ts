import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CHANNELS = [
  { slug: "rumors",       name: "#rumors",       blurb: "Unverified scuttlebutt from the fab floor." },
  { slug: "compensation", name: "#compensation", blurb: "Bands, bonuses, and sign-on deltas." },
  { slug: "layoffs",      name: "#layoffs",      blurb: "RIF watch. Post survivors guides here." },
  { slug: "cpo",          name: "#cpo",          blurb: "Co-packaged optics. Hype vs. shipped." },
  { slug: "silicon",      name: "#silicon",      blurb: "Silicon photonics PDKs, yields, foundries." },
  { slug: "lasers",       name: "#lasers",       blurb: "DFB, VCSEL, QCL, fiber — hot takes only." },
  { slug: "quantum",      name: "#quantum",      blurb: "Photonic qubits and whatever DARPA is paying for." },
  { slug: "careers",      name: "#careers",      blurb: "Interviews, offers, exits." },
  { slug: "ipo-watch",    name: "#ipo-watch",    blurb: "S-1s, SPACs, and other tea leaves." },
];

async function main() {
  for (const c of CHANNELS) {
    await prisma.channel.upsert({
      where: { slug: c.slug },
      update: { name: c.name, blurb: c.blurb },
      create: c,
    });
  }
  console.log(`Seeded ${CHANNELS.length} channels.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
