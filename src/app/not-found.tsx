import Link from "next/link";

export default function NotFound() {
  return (
    <article className="proj" aria-labelledby="nf-title">
      <p className="kicker">Slide missing</p>
      <h1 id="nf-title" className="title-lg">
        This slide isn’t in the carousel.
      </h1>
      <p className="lede" style={{ marginTop: "0.6em" }}>
        It may have been moved or never existed.
      </p>
      <Link href="/" className="btn btn-primary" style={{ marginTop: "1.2em" }}>
        Back to the first slide
      </Link>
    </article>
  );
}
