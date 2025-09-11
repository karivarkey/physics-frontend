import React, { useMemo } from "react";

type TeleprompterTextProps = {
  children: React.ReactNode;
  /** Height in rem units for mobile viewport. Defaults to ~5 lines */
  heightRem?: number;
  /** Animation duration in seconds */
  durationSec?: number;
  className?: string;
};

const TeleprompterText: React.FC<TeleprompterTextProps> = ({
  children,
  heightRem = 6.0,
  durationSec = 18,
  className,
}) => {
  // Duplicate content once to enable seamless loop
  const duplicated = useMemo(() => [children, children], [children]);

  return (
    <div
      className={
        "teleprompter relative overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] " +
        (className ?? "")
      }
      style={{ height: `${heightRem}rem` }}
    >
      <div
        className="teleprompter-content flex flex-col animate-teleprompter motion-reduce:animate-none"
        style={{ animationDuration: `${durationSec}s` }}
      >
        {duplicated.map((node, idx) => (
          <div key={idx} className="pb-2 last:pb-0">
            {node}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeleprompterText;


