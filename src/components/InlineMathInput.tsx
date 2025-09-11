import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type InlineMathInputProps = {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  renderClassName?: string;
  disabled?: boolean;
};

const InlineMathInput: React.FC<InlineMathInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  renderClassName,
  disabled,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // move cursor to end
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  if (disabled) {
    return (
      <div className={renderClassName}>
        {value ? (
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {value}
          </ReactMarkdown>
        ) : null}
      </div>
    );
  }

  return (
    <div className={className}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          placeholder={placeholder}
          className={inputClassName}
        />
      ) : (
        <div
          className={renderClassName}
          onClick={() => setIsEditing(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsEditing(true);
          }}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {value}
            </ReactMarkdown>
          ) : (
            <span className="text-gray-400">{placeholder ?? "Click to edit"}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default InlineMathInput;


