import { requireAdmin } from "@/lib/admin";
import { ArticleTypeAdminPage, articleTypeConfigs } from "@/components/admin/ArticleTypeAdminPage";

export default async function ComparisonsAdminPage() {
  await requireAdmin();
  return <ArticleTypeAdminPage config={articleTypeConfigs.comparisons} />;
}
