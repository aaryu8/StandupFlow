"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, animate] = useAnimate();
  let wordsArray = words.split(" ");
  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration ? duration : 1,
        delay: stagger(0.2),
      }
    );
  }, [scope.current]);

  const renderWords = () => {
  return (
    <motion.div ref={scope} className="flex flex-wrap"> 
      {wordsArray.map((word, idx) => {
        return (
          <motion.span
            key={word + idx}
            className="text-black opacity-0 mr-1" 
            style={{
              filter: filter ? "blur(10px)" : "none",
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.div>
  );
};

  return (
 <div className={cn("", className)}>
      <div className="font-extrabold">
        <div className={`${cormorant.className} dark:text-white font-extrabold text-black text-lg leading-snug tracking-wide`}>
          {renderWords()}
        </div>
      </div>
    </div>   
  );
};

