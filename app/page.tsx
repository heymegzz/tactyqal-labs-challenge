import { Notebook } from "@/components/Notebook";
import { ProjectShelf } from "@/components/ProjectShelf";
import { Feed } from "@/components/Feed";
import { booking, stages } from "@/src/program";
export default function Home() {
  return (
    <>
      <section className="hero wrap">
        <div className="herotext">
          <div className="eyebrow">
            <span className="spot" /> A studio for young builders
          </div>
          <h1>
            Small idea.
            <br />
            <em>Real thing.</em>
          </h1>
          <p>
            Eight weeks of one-to-one mentoring to turn your teen’s idea into an
            app they can put in someone’s hands.
          </p>
          <div className="actions">
            <a className="button" href={booking}>
              Book a free consultation <span>↗</span>
            </a>
            <a className="textlink" href="#projects">
              See student work ↓
            </a>
          </div>
        </div>
        <Notebook />
      </section>
      <section className="paperband" id="program">
        <div className="wrap">
          <div className="eyebrow">The program / Eight weeks</div>
          <h2>
            Inside the <em>workshop.</em>
          </h2>
          <div className="timeline">
            {stages.map((s) => (
              <div key={s.key}>
                <span className="mono">Weeks {s.weeks}</span>
                <h3>{s.label}</h3>
                <p>{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="wrap section" id="projects">
        <div className="eyebrow">From the studio / Student work</div>
        <h2>
          Out in the <em>world.</em>
        </h2>
        <ProjectShelf />
      </section>
      <section className="journalband">
        <div className="wrap section">
          <div className="eyebrow">The journal</div>
          <div className="headingrow">
            <h2>
              Field <em>notes.</em>
            </h2>
            <a href="/blog" className="textlink">
              All articles ↗
            </a>
          </div>
          <Feed compact />
        </div>
      </section>
      <section className="wrap section faq">
        <div>
          <div className="eyebrow">For families</div>
          <h2>
            Before you
            <br />
            <em>begin.</em>
          </h2>
        </div>
        <div>
          {[
            [
              "Does my teen need to know how to code?",
              "Beginners are welcome. Tactyqal uses no-code tools and personal mentoring to guide students from a first idea to an app.",
            ],
            [
              "How much time should we set aside?",
              "Plan for about two to three hours each week, including an hour of live mentoring and independent work.",
            ],
            [
              "How do we get started?",
              "Book a free consultation with the team to discuss your teen’s interests, the current program fee and scheduling.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
          <a className="button" href={booking}>
            Meet the team ↗
          </a>
        </div>
      </section>
    </>
  );
}
