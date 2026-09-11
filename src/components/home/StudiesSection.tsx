import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { STUDIES_INTRO, STUDY_CARDS } from './landingContent';

export function StudiesSection({ onQuoteRequest }: Readonly<{ onQuoteRequest: (studyCode?: string) => void }>) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const showStudy = (studyIndex: number) => {
    carouselRef.current?.children[studyIndex]?.scrollIntoView({
      behavior: globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };
  return (
      <section id="etudes" aria-labelledby="studies-title" className="relative left-1/2 w-screen -translate-x-1/2 scroll-mt-16 bg-[#f7f4ed] py-14 sm:py-18">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:min-h-[34rem] lg:grid-cols-[0.36fr_0.64fr] lg:px-8">
          <div className="flex flex-col items-start">
            <h2 id="studies-title" className="text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">Les études que nous proposons</h2>
            <p className="mt-5 max-w-sm leading-7 text-stone-600">
              {STUDIES_INTRO}
            </p>
            <Button type="button" size="lg" className="mt-7 gap-2" onClick={() => onQuoteRequest()}>
              Demander mon devis <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative min-w-0 lg:min-h-[34rem]">
            <div ref={carouselRef} className="gc-carousel-scrollbar flex h-full gap-4 overflow-x-auto pb-3" aria-label="Types d'études">
              {STUDY_CARDS.map((study, index) => (
                <article
                  key={study.code}
                  className="relative flex min-h-[25rem] w-[82vw] shrink-0 flex-col justify-between rounded-2xl border border-stone-200 bg-white p-7 shadow-[0_12px_24px_-18px_rgba(74,58,38,0.38)] sm:w-[calc((100%-0.5rem)/1.5)] lg:min-h-[33rem]"
                >
                  <button
                    type="button"
                    aria-label={`Afficher ${study.title}`}
                    onClick={() => showStudy(index)}
                    className="absolute inset-0 z-0 cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-inset"
                  />
                  <div className="pointer-events-none relative z-10">
                    <h3 className="text-xl font-black leading-7 text-stone-950">{study.title}</h3>
                    <p className="mt-5 leading-7 text-stone-600">{study.description}</p>
                  </div>
                  <Button type="button" className="relative z-10 mt-8 self-start gap-2" onClick={() => onQuoteRequest(study.code)}>
                    Demander mon devis <ArrowRight className="h-4 w-4" />
                  </Button>
                </article>
              ))}
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#f7f4ed]/80 to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#f7f4ed]/80 to-transparent" />
          </div>
        </div>
      </section>

  );
}
