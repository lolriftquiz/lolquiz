
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const versions = await fetch(
      "https://ddragon.leagueoflegends.com/api/versions.json",
      { next: { revalidate: 3600 } }
    ).then(r => r.json());

    const version = versions[0];

    // Şampiyonların tüm detayları ve yetenekleri
    const champions = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/tr_TR/championFull.json`,
      { next: { revalidate: 3600 } }
    ).then(r => r.json());

    // Eşyalar
    const items = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/tr_TR/item.json`,
      { next: { revalidate: 3600 } }
    ).then(r => r.json());

    return NextResponse.json({
      version,
      champions: Object.values(champions.data),
      items: Object.entries(items.data)
        .filter(
          ([, item]: any) =>
            item.inStore !== false && item.maps?.["11"] !== false
        )
        .map(([id, item]: any) => ({ id, ...item }))
    });
  } catch (error) {
    console.error("Oyun verileri alınamadı:", error);

    return NextResponse.json(
      { error: "Oyun verileri alınamadı." },
      { status: 500 }
    );
  }
}
