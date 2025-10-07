import { useEffect, useState } from "react";
import AnimatedCursor from "react-animated-cursor";

const Cursor = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return (
    <>
      {isDesktop && (
        <AnimatedCursor
          innerSize={12}
          outerSize={35}
          color="0,0,0"
          outerAlpha={0.25}
          innerScale={0.7}
          outerScale={2}
          showSystemCursor={false}
          clickables={[
            "a",
            "button",
            ".link",
            "input[type='text']",
            "input[type='email']",
            "input[type='number']",
            "input[type='submit']",
            "input[type='image']",
            "label[for]",
            "select",
            "textarea",
            ".cursor-hover",
          ]}
        />
      )}
    </>
  );
};

export default Cursor;
