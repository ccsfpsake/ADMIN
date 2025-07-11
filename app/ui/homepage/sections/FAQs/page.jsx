"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import styles from "./FAQs.module.css";
import Image from "next/image";

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      const docRef = doc(db, "Setting", "faqs");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const generalFAQs = data?.faqs?.General || [];

        const cleanedFAQs = generalFAQs.filter(
          (faq) =>
            faq &&
            faq.question &&
            faq.category &&
            Array.isArray(faq.directions)
        );

        setFaqs(cleanedFAQs);
      }
    };

    fetchFAQs();
  }, []);

  const toggleFAQ = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  return (
    <section id="FAQs" className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>FAQs</h2>
        <p className={styles.subtitle}>
          Have questions? Find the answers most valued by our users, along with
          step-by-step instructions and support.
        </p>
      </div>

      <div className={styles.faqContent}>
        {faqs.map((faq, index) => (
          <div key={index} className={styles.faqItem}>
            <button
              className={styles.question}
              onClick={() => toggleFAQ(index)}
              aria-expanded={expanded === index}
              aria-controls={`faq-answer-${index}`}
              id={`faq-question-${index}`}
            >
              {faq.question}
              {expanded === index ? (
                <BiChevronUp className={`${styles.icon} ${styles.rotate}`} />
              ) : (
                <BiChevronDown className={styles.icon} />
              )}
            </button>
            {expanded === index && (
              <div
                id={`faq-answer-${index}`}
                className={styles.answer}
                role="region"
                aria-labelledby={`faq-question-${index}`}
              >
                {faq.directions.map((step, i) => (
                  <div key={i} className={styles.direction}>
                    <p>{step.text}</p>
                    {step.imageUrl && step.imageUrl !== "" && (
                      <div className={styles.imageWrapper}>
                        <Image
                          src={step.imageUrl}
                          alt={`Step ${i + 1}`}
                          width={600}
                          height={400}
                          className={styles.stepImage}
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQs;
