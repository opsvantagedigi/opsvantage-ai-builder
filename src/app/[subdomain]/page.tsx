import DynamicPage from "./[slug]/page"

export default function HomePage(props: { params: { workspaceId: string } }) {
  return DynamicPage({ params: { ...props.params, slug: "home" } })
}
