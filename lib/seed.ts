import { Client } from "@libsql/client";

export async function seedData(db: Client): Promise<void> {
  // 8 Categories as specified in PRD & DESIGN
  const categories = [
    {
      id: "cat-1",
      name: "Tenda",
      slug: "tenda",
      image_url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
      sort_order: 1,
      is_active: 1,
    },
    {
      id: "cat-2",
      name: "Carrier",
      slug: "carrier",
      image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      sort_order: 2,
      is_active: 1,
    },
    {
      id: "cat-3",
      name: "Alat Masak",
      slug: "alat-masak",
      image_url: "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80",
      sort_order: 3,
      is_active: 1,
    },
    {
      id: "cat-4",
      name: "Elektronik",
      slug: "elektronik",
      image_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
      sort_order: 4,
      is_active: 1,
    },
    {
      id: "cat-5",
      name: "Penerangan",
      slug: "penerangan",
      image_url: "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80",
      sort_order: 5,
      is_active: 1,
    },
    {
      id: "cat-6",
      name: "Survival",
      slug: "survival",
      image_url: "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80",
      sort_order: 6,
      is_active: 1,
    },
    {
      id: "cat-7",
      name: "Perlengkapan Pribadi",
      slug: "perlengkapan-pribadi",
      image_url: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80",
      sort_order: 7,
      is_active: 1,
    },
    {
      id: "cat-8",
      name: "Perlengkapan Tambahan",
      slug: "perlengkapan-tambahan",
      image_url: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80",
      sort_order: 8,
      is_active: 1,
    },
  ];

  for (const cat of categories) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO categories (id, name, slug, image_url, sort_order, is_active)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [cat.id, cat.name, cat.slug, cat.image_url, cat.sort_order, cat.is_active],
    });
  }

  // Realistic Products as specified in PRD & DESIGN
  const products = [
    {
      id: "prod-1",
      category_id: "cat-1",
      name: "Bivak Set",
      slug: "bivak-set",
      description: "Ukuran 3 x 4 meter. Paket lengkap: flysheet waterproof ripstop premium warna merah rimba, 2 set tiang duralumin teleskopik kokoh, 8 pasak pasak baja galvanis, dan 6 tali prusik reflektif + stopper aluminium. Sangat cocok untuk shelter darurat, bushcraft, dan camping praktis.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
      ]),
      is_active: 1,
      tiers: [
        { days: 2, price: 38000 },
        { days: 3, price: 52000 },
        { days: 4, price: 62000 },
        { days: 5, price: 72000 },
      ],
    },
    {
      id: "prod-2",
      category_id: "cat-1",
      name: "Tenda Dome 4 Orang",
      slug: "tenda-dome-4-orang",
      description: "Tenda dome double layer kapasitas 4 orang dengan vestibule teras depan lapang untuk tempat memasak dan menyimpan sepatu/carrier. Material outer 210T Polyester PU 3000mm tahan hujan deras badai gunung. Lengkap dengan footprint dan tas jinjing.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=800&q=80",
      ]),
      is_active: 1,
      tiers: [
        { days: 2, price: 55000 },
        { days: 3, price: 75000 },
        { days: 4, price: 90000 },
        { days: 5, price: 105000 },
      ],
    },
    {
      id: "prod-3",
      category_id: "cat-1",
      name: "Flysheet 4x6 Meter",
      slug: "flysheet-4x6-meter",
      description: "Flysheet ukuran besar 4 x 6 meter bahan Taslan Milky waterproof coating. Dilengkapi dengan 19 titik loop webbing bertulang di setiap sisi dan sudut, sangat kokoh menahan terpaan angin dan hujan deras.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
      ]),
      is_active: 1,
      tiers: [
        { days: 2, price: 45000 },
        { days: 3, price: 60000 },
        { days: 4, price: 75000 },
      ],
    },
    {
      id: "prod-4",
      category_id: "cat-7",
      name: "Matras Camping Thermal",
      slug: "matras-camping-thermal",
      description: "Matras isolasi thermal bahan aluminium foil bolak-balik busa IXPE tebal 4mm. Efektif memantulkan panas tubuh dan memblokir dinginnya hawa tanah pegunungan. Dimensi 200 x 100 cm.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80",
      ]),
      is_active: 1,
      tiers: [
        { days: 2, price: 15000 },
        { days: 3, price: 20000 },
        { days: 4, price: 25000 },
      ],
    },
    {
      id: "prod-5",
      category_id: "cat-2",
      name: "Carrier 60L Pro Series",
      slug: "carrier-60l-pro",
      description: "Tas gunung ekspedisi 60 liter dengan frame aluminium ganda dan backsystem adjustable torso bersirkulasi udara dingin. Dilengkapi kompartemen bawah terpisah untuk sleeping bag dan gratis raincover waterproof.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      ]),
      is_active: 1,
      tiers: [
        { days: 2, price: 65000 },
        { days: 3, price: 90000 },
        { days: 4, price: 110000 },
        { days: 5, price: 130000 },
      ],
    },
    {
      id: "prod-6",
      category_id: "cat-3",
      name: "Cooking Set Nesting DS-308",
      slug: "cooking-set-nesting-ds308",
      description: "Paket alat masak outdoor lengkap berbahan hard anodized aluminium tebal dan food grade. Berisi: panci besar, panci sedang, wajan penggorengan, 3 mangkok kuah, centong sup, sendok kayu, dan busa cuci dalam tas jaring.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80",
      ]),
      is_active: 1,
      tiers: [
        { days: 2, price: 25000 },
        { days: 3, price: 35000 },
        { days: 4, price: 45000 },
      ],
    },
    {
      id: "prod-7",
      category_id: "cat-3",
      name: "Kompor Windproof Ultralight",
      slug: "kompor-windproof-ultralight",
      description: "Kompor gas portable model kelopak mawar anti-angin dengan leher selang fleksibel dan pemantik elektrik terintegrasi. Pembakaran merata dan hemat gas bahkan pada angin kencang.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80",
      ]),
      is_active: 1,
      tiers: [
        { days: 2, price: 20000 },
        { days: 3, price: 28000 },
        { days: 4, price: 35000 },
      ],
    },
    {
      id: "prod-8",
      category_id: "cat-5",
      name: "Headlamp 300 Lumens Waterproof",
      slug: "headlamp-300-lumens",
      description: "Senter kepala pendakian terang 300 lumens dengan sensor infrared lambaian tangan untuk menyalakan/mematikan tanpa sentuh. Rechargeable baterai Type-C tahan hingga 10 jam pemakaian.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80",
      ]),
      is_active: 1,
      tiers: [
        { days: 2, price: 18000 },
        { days: 3, price: 25000 },
        { days: 4, price: 30000 },
      ],
    },
    {
      id: "prod-9",
      category_id: "cat-7",
      name: "Sleeping Bag Polar Dacron",
      slug: "sleeping-bag-polar-dacron",
      description: "Kantong tidur model selimut dengan isian dacron 6oz empuk dan lapisan dalam polar fleece lembut menyerap kehangatan. Batas kenyamanan suhu 8°C hingga 12°C.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80",
      ]),
      is_active: 1,
      tiers: [
        { days: 2, price: 25000 },
        { days: 3, price: 35000 },
        { days: 4, price: 45000 },
      ],
    },
    {
      id: "prod-10",
      category_id: "cat-8",
      name: "Trekking Pole Duralumin (Sepasang)",
      slug: "trekking-pole-duralumin",
      description: "Sepasang tongkat pendakian duralumin alloy 7075 yang ringan namun kuat. Dilengkapi teknologi anti-shock peredam benturan dan handle busa EVA ergonomis.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80",
      ]),
      is_active: 1,
      tiers: [
        { days: 2, price: 20000 },
        { days: 3, price: 28000 },
        { days: 4, price: 35000 },
      ],
    },
  ];

  for (const prod of products) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO products (id, category_id, name, slug, description, images, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [prod.id, prod.category_id, prod.name, prod.slug, prod.description, prod.images, prod.is_active],
    });

    for (let i = 0; i < prod.tiers.length; i++) {
      const tier = prod.tiers[i];
      const tierId = `tier-${prod.id}-${tier.days}`;
      await db.execute({
        sql: `INSERT OR REPLACE INTO pricing_tiers (id, product_id, days, price)
              VALUES (?, ?, ?, ?)`,
        args: [tierId, prod.id, tier.days, tier.price],
      });
    }
  }

  // Sample order for demo/admin
  const sampleOrderId = "ORD-2026-001";
  await db.execute({
    sql: `INSERT OR REPLACE INTO orders (id, customer_name, phone, address, id_photo_url, total_price, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      sampleOrderId,
      "Dimas Prasetyo",
      "081298765432",
      "Jl. Rinjani No. 14, Jakarta Selatan",
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
      92000,
      "baru",
      new Date().toISOString(),
    ],
  });

  await db.execute({
    sql: `INSERT OR REPLACE INTO order_items (id, order_id, product_id, product_name, days, price)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: ["item-1", sampleOrderId, "prod-1", "Bivak Set", 3, 52000],
  });

  await db.execute({
    sql: `INSERT OR REPLACE INTO order_items (id, order_id, product_id, product_name, days, price)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: ["item-2", sampleOrderId, "prod-2", "Tenda Dome 4 Orang", 2, 40000],
  });

  // Seed default admin
  await seedAdmin(db);
}

export async function seedAdmin(db: Client): Promise<void> {
  const checkAdmin = await db.execute("SELECT COUNT(*) as count FROM admins");
  const count = Number(checkAdmin.rows[0]?.count ?? 0);

  if (count === 0) {
    await db.execute({
      sql: `INSERT INTO admins (id, username, password, name, role, created_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        "admin-1",
        "admin",
        "rimbagear2026",
        "Administrator Your Brand",
        "admin",
        new Date().toISOString(),
      ],
    });
  }
}
