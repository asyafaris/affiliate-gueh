import { requireAdmin } from "@/lib/admin";
import { ArticleTypeAdminPage, articleTypeConfigs } from "@/components/admin/ArticleTypeAdminPage";

export default async function BestPicksAdminPage() {
  await requireAdmin();
  return <ArticleTypeAdminPage config={articleTypeConfigs.bestPicks} />;
}
