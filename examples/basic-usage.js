// Run with: node examples/basic-usage.js
// (after `npm run build`, since this imports the compiled dist/ output)
import { AfreumClient } from "../dist/index.js";

const afreum = new AfreumClient();

async function main() {
  const flexibleTokens = await afreum.tokens.flexible();
  console.log(`Flexible tokens: ${flexibleTokens.map((t) => t.token).join(", ")}`);

  const afr = await afreum.tokens.findBySymbol("AFR");
  console.log("AFR token record:", afr);

  const nigeria = await afreum.geo.findCountryByIso("NG");
  console.log("Nigeria:", nigeria?.name, nigeria?.flexible_token);

  console.log("AFR logo URL:", afreum.logos.afreumTokenUrl("AFR"));
  console.log("BTC logo URL:", afreum.logos.tokenUrl("BTC"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
