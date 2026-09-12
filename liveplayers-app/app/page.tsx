import { CoastalMark } from "@/components/CoastalMark";
import { CtaButton } from "@/components/CtaButton";
import { FaqList } from "@/components/FaqList";
import { Reveal } from "@/components/Reveal";
import { StickyApply } from "@/components/StickyApply";
import {
  advisors,
  benefits,
  companies,
  curriculum,
  fellowship,
  funding,
  hero,
  kyleStory,
  livePlayer,
  peopleNotes,
  problem,
  profile,
  work,
} from "@/lib/content";
import { APPLY_URL, ARTIZEN_URL, CONTACT_EMAIL, EVENTS } from "@/lib/site";

/**
 * One-page fellowship landing. Content comes from the program deck, not slide screenshots.
 */
export default function HomePage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ivory focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <header className="relative overflow-hidden bg-navy text-ivory">
        <CoastalMark className="pointer-events-none absolute -right-10 top-0 hidden w-[min(560px,70vw)] opacity-80 md:block" />
        <div className="relative mx-auto flex max-w-page items-center justify-between px-5 py-6 md:px-8">
          <p className="text-xs uppercase tracking-[0.22em] text-gold">Kuzana</p>
          <nav aria-label="Page" className="hidden gap-6 text-sm text-ivory/80 md:flex">
            <a href="#fellowship" className="hover:text-gold">The fellowship</a>
            <a href="#funding" className="hover:text-gold">Fund a fellow</a>
            <a href="#faq" className="hover:text-gold">FAQ</a>
          </nav>
        </div>

        <div className="relative mx-auto grid max-w-page gap-10 px-5 pb-20 pt-10 md:px-8 md:pb-28 md:pt-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gold">{hero.eyebrow}</p>
            <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[0.95] md:text-7xl">
              {hero.title}
            </h1>
            <p className="mt-8 max-w-md text-xl leading-8 text-ivory/90">{hero.line}</p>
            <p className="mt-4 font-serif text-2xl text-gold">“{hero.quote}”</p>
            <p className="mt-3 text-sm text-ivory/90">{hero.supporting}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <CtaButton href={APPLY_URL} eventName={EVENTS.apply}>
                Apply Now
              </CtaButton>
              <CtaButton href={ARTIZEN_URL} eventName={EVENTS.fund} variant="ghost">
                Fund a Fellow
              </CtaButton>
            </div>
          </div>
          <p className="self-end max-w-sm text-sm leading-7 text-ivory/90 lg:pb-4">
            For ambitious Kenyan and Kenyan-diaspora operators, 18–35, who want high-leverage
            operating experience instead of a low-productivity default path.
          </p>
        </div>
      </header>

      <main id="main">
        <Reveal>
          <section className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-28" aria-labelledby="problem-title">
            <p className="text-xs uppercase tracking-[0.2em] text-teal">{problem.kicker}</p>
            <h2 id="problem-title" className="mt-4 max-w-2xl font-serif text-4xl leading-tight md:text-5xl">
              {problem.title}
            </h2>
            <div className="mt-10 max-w-lg space-y-4 text-lg leading-8">
              {problem.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="bg-navy text-ivory" aria-labelledby="player-title">
            <div className="mx-auto grid max-w-page gap-10 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gold">{livePlayer.kicker}</p>
                <h2 id="player-title" className="mt-4 font-serif text-4xl md:text-5xl">
                  {livePlayer.title}
                </h2>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gold">Live player (n.)</p>
                <p className="mt-4 font-serif text-3xl leading-snug">{livePlayer.definition}</p>
                <p className="mt-8 text-gold">{livePlayer.closer}</p>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-28" aria-labelledby="story-title">
            <p className="text-xs uppercase tracking-[0.2em] text-teal">{kyleStory.kicker}</p>
            <h2 id="story-title" className="mt-4 font-serif text-4xl md:text-5xl">
              {kyleStory.title}
            </h2>
            <p className="mt-6 text-coral">{kyleStory.honor}</p>
            <div className="mt-8 max-w-2xl space-y-5 text-lg leading-8">
              {kyleStory.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <p className="mt-8 font-serif text-2xl text-teal">{kyleStory.closer}</p>
          </section>
        </Reveal>

        <Reveal>
          <section id="fellowship" className="border-y border-navy/10" aria-labelledby="fellowship-title">
            <div className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-28">
              <p className="text-xs uppercase tracking-[0.2em] text-teal">{fellowship.kicker}</p>
              <h2 id="fellowship-title" className="mt-4 max-w-xl font-serif text-4xl md:text-5xl">
                {fellowship.title}
              </h2>
              <p className="mt-4 text-teal">{fellowship.nights}</p>
              <ol className="mt-12 grid gap-8 md:grid-cols-2">
                {fellowship.items.map((item, index) => (
                  <li key={item} className="list-none border-t border-navy/15 pt-4">
                    <span className="text-xs tracking-[0.18em] text-coral">0{index + 1}</span>
                    <p className="mt-2 font-serif text-2xl">{item}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-28" aria-labelledby="work-title">
            <p className="text-xs uppercase tracking-[0.2em] text-teal">{work.kicker}</p>
            <h2 id="work-title" className="mt-4 max-w-xl font-serif text-4xl md:text-5xl">
              {work.title}
            </h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {work.items.map((item) => (
                <li key={item} className="border-l border-gold pl-4 text-lg leading-7">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-10 max-w-xl text-lg leading-8">{work.closer}</p>
          </section>
        </Reveal>

        <Reveal>
          <section className="bg-[#efe6d6]" aria-labelledby="curriculum-title">
            <div className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-28">
              <p className="text-xs uppercase tracking-[0.2em] text-teal">{curriculum.kicker}</p>
              <h2 id="curriculum-title" className="mt-4 font-serif text-4xl md:text-5xl">
                {curriculum.title}
              </h2>
              <p className="mt-6 text-sm uppercase tracking-[0.16em] text-navy/60">{curriculum.lead}</p>
              <ul className="mt-8 max-w-2xl space-y-5">
                {curriculum.questions.map((question) => (
                  <li key={question} className="font-serif text-2xl leading-snug md:text-3xl">
                    {question}
                  </li>
                ))}
              </ul>
              <p className="mt-10 max-w-xl text-lg">{curriculum.closer}</p>
              <p className="mt-4 max-w-xl text-navy/75">{curriculum.project}</p>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-28" aria-labelledby="support-title">
            <h2 id="support-title" className="font-serif text-4xl md:text-5xl">
              Enough support to do serious work
            </h2>
            <div className="mt-12 grid gap-14 md:grid-cols-2">
              <div>
                <h3 className="text-xs uppercase tracking-[0.18em] text-teal">Benefits</h3>
                <ul className="mt-5 space-y-3 text-lg">
                  {benefits.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-[0.18em] text-teal">Who it is for</h3>
                <ul className="mt-5 space-y-3 text-lg">
                  {profile.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="border-t border-navy/10" aria-labelledby="companies-title">
            <div className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-28">
              <h2 id="companies-title" className="font-serif text-4xl md:text-5xl">
                Participating companies and advisors
              </h2>
              <p className="mt-4 max-w-xl text-navy/80">
                Example companies fellows may work inside.
              </p>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-lg">
                {companies.map((company) => (
                  <li key={company} className="border-b border-gold/80 pb-1">
                    {company}
                  </li>
                ))}
              </ul>

              <h3 className="mt-16 text-xs uppercase tracking-[0.18em] text-teal">
                Built around people who know talent, startups and African execution
              </h3>
              <ul className="mt-8 grid gap-8 md:grid-cols-3">
                {advisors.map((person) => (
                  <li key={person.name} className="list-none">
                    <p className="font-serif text-2xl">{person.name}</p>
                    <p className="mt-2 text-sm text-teal">{person.role}</p>
                  </li>
                ))}
              </ul>
              <ul className="mt-10 max-w-2xl space-y-3 text-navy/80">
                {peopleNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="funding" className="bg-navy text-ivory" aria-labelledby="funding-title">
            <div className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-28">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">{funding.kicker}</p>
              <h2 id="funding-title" className="mt-4 font-serif text-4xl md:text-5xl">
                {funding.title}
              </h2>
              <dl className="mt-12 grid gap-8 sm:grid-cols-2">
                {funding.figures.map((figure) => (
                  <div key={figure.label} className="border-t border-ivory/15 pt-4">
                    <dt className="text-sm text-ivory/70">{figure.label}</dt>
                    <dd className="mt-2 font-serif text-4xl text-gold">{figure.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-12 max-w-2xl space-y-4 text-ivory/85">
                {funding.notes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
              <div className="mt-10">
                <CtaButton href={ARTIZEN_URL} eventName={EVENTS.fund} variant="gold">
                  Fund a Fellow
                </CtaButton>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="faq" className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-28" aria-labelledby="faq-title">
            <h2 id="faq-title" className="font-serif text-4xl md:text-5xl">
              Questions
            </h2>
            <div className="mt-8">
              <FaqList />
            </div>
          </section>
        </Reveal>

        <section className="bg-navy text-ivory" aria-labelledby="final-title">
          <div className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-28">
            <h2 id="final-title" className="max-w-xl font-serif text-4xl md:text-6xl">
              Choose a higher-leverage path.
            </h2>
            <p className="mt-6 max-w-lg text-lg text-ivory/80">{hero.line}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <CtaButton href={APPLY_URL} eventName={EVENTS.apply}>
                Apply Now
              </CtaButton>
              <CtaButton href={ARTIZEN_URL} eventName={EVENTS.fund} variant="ghost">
                Fund a Fellow
              </CtaButton>
            </div>
            <p className="mt-10 text-sm text-ivory/60">
              Questions?{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                data-event={EVENTS.contact}
                className="text-gold underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-ivory px-5 py-8 text-sm text-navy/60 md:px-8">
        <div className="mx-auto flex max-w-page flex-col justify-between gap-2 sm:flex-row">
          <p>Live Players Mittlemann Fellowship</p>
          <p>Nairobi · May–September 2027</p>
        </div>
      </footer>

      <StickyApply />
      <div className="h-16 md:hidden" aria-hidden="true" />
    </>
  );
}
