import { Feed } from "@/components/Feed";
export const metadata = { title: "Field notes" };
export default function Blog() {
  return (
    <section className="wrap section">
      <div className="eyebrow">Tactyqal Labs / Journal</div>
      <h1 className="pagetitle">
        Field <em>notes.</em>
      </h1>
      <p className="lede">
        Short exercises for turning a question into a working product.
      </p>
      <Feed />
    </section>
  );
}
