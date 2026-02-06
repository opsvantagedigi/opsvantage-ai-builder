import DynamicPage from "./[slug]/page"

export default function HomePage(props: { params: { subdomain: string } }) {
  return DynamicPage({ params: { ...props.params, slug: "home" } })
}
