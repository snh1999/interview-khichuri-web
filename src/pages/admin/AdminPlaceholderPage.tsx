import { EmptyPage } from "@/pages/EmptyPage.tsx";

interface IProps {
  title: string;
}

const AdminPlaceholderPage = ({ title }: Readonly<IProps>) => (
  <EmptyPage description="This admin page is not built yet." title={title} />
);

export default AdminPlaceholderPage;
