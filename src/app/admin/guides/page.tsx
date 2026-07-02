import { requireAdmin } from "@/lib/admin";
import { ArticleTypeAdminPage, articleTypeConfigs } from "@/components/admin/ArticleTypeAdminPage";

export default async function GuidesAdminPage() {
  await requireAdmin();
  return <ArticleTypeAdminPage config={articleTypeConfigs.guides} />;
}
