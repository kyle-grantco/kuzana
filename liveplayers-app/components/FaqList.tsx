"use client";

import { useState } from "react";
import { faqs } from "@/lib/content";

/**
 * Accessible accordion for fellowship questions.
 */
export function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-navy/10 border-y border-navy/10">
      {faqs.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <div key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-6 py-5 text-left font-serif text-xl text-navy"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                {item.question}
                <span aria-hidden="true" className="text-teal">
                  {isOpen ? "–" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-5 text-base leading-7 text-navy/80"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
