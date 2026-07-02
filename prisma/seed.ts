import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { ArticleType } from "../src/types/domain";

const prisma = new PrismaClient();

const img = (q: string) =>
  `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&${q}`;

const productsSeed = [
  ["kursi-ergonomis-basic-pro", "Kursi Ergonomis Basic Pro", "Kursi Kerja", "ErgoHaus", 899000, "Kursi mesh dengan lumbar support adjustable untuk WFH harian.", "Pilihan aman untuk pekerja remote yang butuh postur lebih rapi tanpa masuk kelas premium.", "WFH 6-8 jam, kamar sempit, budget menengah"],
  ["meja-kerja-minimalis-120-cm", "Meja Kerja Minimalis 120 cm", "Meja Kerja", "NordikLab", 749000, "Meja kerja 120 cm dengan rangka kokoh dan top table clean.", "Ukuran 120 cm cukup lega untuk laptop, monitor, dan lampu tanpa terasa memenuhi kamar.", "Setup laptop + monitor, ruang kos, gaya minimalis"],
  ["keyboard-wireless-low-profile", "Keyboard Wireless Low Profile", "Keyboard", "KeyNusa", 549000, "Keyboard tipis bluetooth multi-device dengan travel pendek.", "Nyaman untuk mengetik panjang, mudah dipindah antar laptop/tablet, dan tidak berisik.", "Penulis, admin, kerja hybrid"],
  ["mouse-silent-wireless", "Mouse Silent Wireless", "Mouse", "ClickPro", 189000, "Mouse silent ringkas dengan DPI adjustable dan receiver 2.4 GHz.", "Worth it untuk ruang kerja bersama karena kliknya tenang dan baterainya awet.", "Meeting online, kantor bersama, pengguna laptop"],
  ["monitor-stand-kayu-minimalis", "Monitor Stand Kayu Minimalis", "Aksesori Setup", "NordikLab", 249000, "Stand kayu untuk menaikkan monitor dan merapikan meja.", "Upgrade kecil yang langsung terasa: layar lebih sejajar mata dan area bawah bisa untuk keyboard.", "Meja kecil, setup aesthetic, posture upgrade"],
  ["lampu-meja-led-adjustable", "Lampu Meja LED Adjustable", "Aksesori Setup", "LumaDesk", 329000, "Lampu meja LED dengan temperatur warna dan brightness bertingkat.", "Membantu kerja malam tanpa membuat meja terasa seperti studio foto berlebihan.", "Kerja malam, membaca, kamar minim cahaya"],
  ["desk-mat-premium", "Desk Mat Premium", "Aksesori Setup", "DeskFit", 159000, "Desk mat lebar anti-slip dengan permukaan halus.", "Membuat mouse lebih stabil dan meja terasa lebih rapi dalam satu langkah murah.", "Setup rapi, mouse movement luas, foto meja"],
  ["laptop-stand-portable", "Laptop Stand Portable", "Aksesori Setup", "DeskFit", 199000, "Stand laptop lipat aluminium dengan tinggi bertingkat.", "Cocok untuk kerja mobile karena ringan, tidak makan tempat, dan membantu posisi layar.", "Kerja kafe, hybrid, laptop 13-15 inci"],
  ["webcam-full-hd", "Webcam Full HD", "Gadget Ringan", "MeetCam", 399000, "Webcam 1080p dengan autofocus dan privacy cover.", "Cukup untuk meeting profesional tanpa perlu kamera mahal.", "Zoom, interview online, kelas remote"],
  ["headset-kerja-wireless", "Headset Kerja Wireless", "Gadget Ringan", "SoundWork", 679000, "Headset wireless ringan dengan mic noise reduction.", "Lebih nyaman untuk meeting panjang dibanding earbud kecil, terutama di rumah ramai.", "Meeting harian, customer support, rumah ramai"],
  ["organizer-kabel", "Organizer Kabel", "Aksesori Setup", "DeskFit", 79000, "Set cable clip dan sleeve untuk merapikan kabel meja.", "Murah, sederhana, tapi efek visualnya besar untuk setup yang sering berantakan.", "Cable management pemula, meja kecil"],
  ["footrest-ergonomis", "Footrest Ergonomis", "Kursi Kerja", "ErgoHaus", 229000, "Footrest miring dengan permukaan bertekstur.", "Berguna saat kaki menggantung atau meja terlalu tinggi, terutama untuk pengguna bertubuh kecil.", "Postur duduk, meja tinggi, kerja lama"]
] as const;

const ArticleType = {
  GUIDE: "GUIDE",
  REVIEW: "REVIEW",
  COMPARISON: "COMPARISON",
  BEST_PICKS: "BEST_PICKS",
  TIPS: "TIPS"
} as const satisfies Record<ArticleType, ArticleType>;

const ProsConsType = {
  PRO: "PRO",
  CON: "CON"
} as const;

type SeedProduct = {
  id: string;
  slug: string;
  categoryId: string;
  name: string;
  shortDescription: string;
  editorialSummary: string;
};

async function main() {
  await prisma.affiliateClick.deleteMany();
  await prisma.seoMetadata.deleteMany();
  await prisma.homepageSection.deleteMany();
  await prisma.articleProduct.deleteMany();
  await prisma.articleCategory.deleteMany();
  await prisma.article.deleteMany();
  await prisma.productProsCons.deleteMany();
  await prisma.productSpec.deleteMany();
  await prisma.productAffiliateLink.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL ?? "admin@affiliategueh.local",
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "admin12345", 12),
      name: "Rani Prawira",
      title: "Editor worthgoods"
    }
  });

  const categories = await Promise.all(
    ["Kursi Kerja", "Meja Kerja", "Keyboard", "Mouse", "Aksesori Setup", "Gadget Ringan"].map((name, i) =>
      prisma.category.create({
        data: {
          name,
          slug: name.toLowerCase().replaceAll(" ", "-"),
          description: `Kurasi ${name.toLowerCase()} untuk setup kerja yang fungsional, nyaman, dan tetap masuk akal secara budget.`,
          featured: i < 5,
          sortOrder: i
        }
      })
    )
  );

  const brands = await Promise.all(
    ["ErgoHaus", "NordikLab", "KeyNusa", "ClickPro", "LumaDesk", "DeskFit", "MeetCam", "SoundWork"].map((name) =>
      prisma.brand.create({
        data: {
          name,
          slug: name.toLowerCase(),
          websiteUrl: `https://example.com/${name.toLowerCase()}`,
          description: `${name} dikenal lewat produk setup kerja dengan value yang kuat di kelas harganya.`,
          logoUrl: "https://placehold.co/200x80?text=" + encodeURIComponent(name)
        }
      })
    )
  );

  const categoryByName = Object.fromEntries(categories.map((c) => [c.name, c]));
  const brandByName = Object.fromEntries(brands.map((b) => [b.name, b]));

  const products: SeedProduct[] = [];
  for (const [slug, name, category, brand, price, shortDescription, editorialSummary, bestFor] of productsSeed) {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId: categoryByName[category].id,
        brandId: brandByName[brand].id,
        shortDescription,
        editorialSummary,
        bestFor,
        priceEstimate: price,
        isFeatured: products.length < 6,
        isPublished: true,
        publishedAt: new Date(),
        images: {
          create: [
            {
              imageUrl: img(`sig=${products.length}`),
              altText: name,
              caption: "Foto ilustrasi produk dalam konteks setup kerja.",
              isPrimary: true
            }
          ]
        },
        specs: {
          create: [
            { specGroup: "Umum", label: "Kategori", value: category, sortOrder: 1 },
            { specGroup: "Umum", label: "Brand", value: brand, sortOrder: 2 },
            { specGroup: "Pembelian", label: "Estimasi harga", value: `Rp${price.toLocaleString("id-ID")}`, sortOrder: 3 }
          ]
        },
        prosCons: {
          create: [
            { type: ProsConsType.PRO, content: "Value kuat untuk kebutuhan kerja harian.", sortOrder: 1 },
            { type: ProsConsType.PRO, content: "Mudah dipadukan dengan setup meja minimalis.", sortOrder: 2 },
            { type: ProsConsType.CON, content: "Bukan pilihan paling premium untuk pengguna profesional berat.", sortOrder: 3 },
            { type: ProsConsType.CON, content: "Promo dan stok bisa berubah antar marketplace.", sortOrder: 4 }
          ]
        }
      }
    });
    products.push(product);
  }

  let linkCount = 0;
  for (const product of products) {
    for (const merchant of ["Shopee", "Tokopedia"].slice(0, linkCount < 16 ? 2 : 1)) {
      linkCount++;
      await prisma.productAffiliateLink.create({
        data: {
          productId: product.id,
          merchantName: merchant,
          buttonLabel: `Cek di ${merchant}`,
          affiliateUrl: `https://example.com/${merchant.toLowerCase()}/${product.slug}?aff=affiliate-gueh`,
          redirectCode: `${product.slug}-${merchant.toLowerCase()}`,
          isPrimary: merchant === "Shopee",
          isActive: true,
          sortOrder: merchant === "Shopee" ? 1 : 2
        }
      });
    }
  }

  const articleSeeds = [
    ["barang-setup-kerja-paling-worth-it", "Barang Setup Kerja Paling Worth It untuk Mulai WFH", ArticleType.BEST_PICKS, [0, 2, 4, 7, 10]],
    ["kursi-ergonomis-terbaik-untuk-wfh", "Kursi Ergonomis Terbaik untuk WFH Budget Masuk Akal", ArticleType.BEST_PICKS, [0, 11]],
    ["keyboard-wireless-terbaik-untuk-kerja", "Keyboard Wireless Terbaik untuk Kerja Harian", ArticleType.BEST_PICKS, [2, 3]],
    ["cara-memilih-kursi-kerja", "Cara Memilih Kursi Kerja agar Tidak Cepat Pegal", ArticleType.GUIDE, [0, 11]],
    ["desk-setup-kamar-kecil", "Desk Setup Kamar Kecil: Prioritas Barang yang Sebaiknya Dibeli Dulu", ArticleType.GUIDE, [1, 4, 6, 10]],
    ["review-keyboard-low-profile", "Review Keyboard Wireless Low Profile untuk Kerja Panjang", ArticleType.REVIEW, [2]],
    ["meja-120-vs-monitor-stand", "Meja 120 cm vs Monitor Stand: Mana Upgrade yang Lebih Terasa?", ArticleType.COMPARISON, [1, 4]],
    ["mouse-silent-vs-keyboard-low-profile", "Mouse Silent vs Keyboard Low Profile untuk Produktivitas", ArticleType.COMPARISON, [2, 3]],
    ["webcam-vs-headset-untuk-meeting", "Webcam Full HD vs Headset Wireless: Prioritas Meeting Online", ArticleType.COMPARISON, [8, 9]],
    ["tips-rapikan-kabel-meja", "Tips Merapikan Kabel Meja Tanpa Beli Banyak Aksesori", ArticleType.TIPS, [10]],
    ["lampu-meja-untuk-kerja-malam", "Lampu Meja untuk Kerja Malam: Apa yang Perlu Dicek?", ArticleType.GUIDE, [5]],
    ["laptop-stand-portable-worth-it", "Apakah Laptop Stand Portable Worth It untuk Kerja Hybrid?", ArticleType.REVIEW, [7]],
    ["desk-mat-premium-worth-it", "Desk Mat Premium: Estetika atau Benar-benar Membantu?", ArticleType.REVIEW, [6]],
    ["setup-produktivitas-di-bawah-1-juta", "Setup Produktivitas di Bawah 1 Juta", ArticleType.BEST_PICKS, [3, 6, 7, 10]]
  ] as const;

  for (const [slug, title, articleType, productIndexes] of articleSeeds) {
    const article = await prisma.article.create({
      data: {
        authorId: admin.id,
        title,
        slug,
        excerpt: "Panduan editorial berbasis kebutuhan, budget, dan kompromi yang realistis untuk pembeli Indonesia.",
        coverImageUrl: img(`article=${slug}`),
        articleType,
        isPublished: true,
        publishedAt: new Date(),
        contentMd: `## Ringkasan keputusan\n\nArtikel ini membantu Anda memilih berdasarkan kebutuhan nyata, bukan sekadar produk yang sedang ramai. Kami melihat fungsi utama, kompromi harga, kenyamanan dipakai harian, dan kemudahan membeli di marketplace Indonesia.\n\n## Cara membaca rekomendasi\n\nMulai dari masalah yang ingin diselesaikan: pegal, meja berantakan, meeting kurang jelas, atau setup terlalu sempit. Setelah itu cocokkan budget dengan fitur yang benar-benar dipakai.\n\n## Catatan editorial\n\nRekomendasi dapat mengandung affiliate link, tetapi urutan dan catatan produk disusun dari pertimbangan editorial. Harga, promo, dan stok bisa berubah di marketplace.`,
        categories: {
          create: [{ categoryId: products[productIndexes[0]].categoryId }]
        },
        products: {
          create: productIndexes.map((index, sortOrder) => ({
            productId: products[index].id,
            placementNote: sortOrder === 0 ? "Pilihan utama untuk intent artikel ini." : "Alternatif yang layak dibandingkan.",
            sortOrder
          }))
        }
      }
    });

    await prisma.seoMetadata.create({
      data: {
        subjectType: "article",
        subjectId: article.id,
        seoTitle: `${title} | worthgoods`,
        metaDescription: article.excerpt,
        ogTitle: title,
        ogDescription: article.excerpt,
        ogImageUrl: article.coverImageUrl,
        schemaHint: articleType
      }
    });
  }

  for (const product of products) {
    await prisma.seoMetadata.create({
      data: {
        subjectType: "product",
        subjectId: product.id,
        seoTitle: `${product.name}: Review Singkat, Kelebihan, Kekurangan`,
        metaDescription: product.shortDescription,
        ogTitle: product.name,
        ogDescription: product.editorialSummary,
        ogImageUrl: img(`seo=${product.slug}`),
        schemaHint: "Product"
      }
    });
  }

  await prisma.homepageSection.createMany({
    data: [
      {
        sectionKey: "hero",
        title: "Rekomendasi produk worth it untuk setup kerja yang lebih enak dipakai.",
        subtitle: "Kurasi editorial untuk WFH, meja kerja, gadget ringan, dan aksesori kamar yang fungsional.",
        payload: { cta: "Mulai cari rekomendasi" },
        sortOrder: 1
      },
      {
        sectionKey: "methodology",
        title: "Cara kami memilih produk",
        subtitle: "Kami menilai use case, budget, kompromi, kemudahan beli, dan konteks pengguna Indonesia.",
        payload: { points: ["Kebutuhan nyata", "Harga masuk akal", "Kelebihan dan kekurangan jujur"] },
        sortOrder: 2
      }
    ]
  });

  console.log("Seed complete. Admin:", admin.email, "password:", process.env.ADMIN_PASSWORD ?? "admin12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
