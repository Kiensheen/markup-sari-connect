import { useRef, useEffect, useCallback, type ReactNode } from "react";

export interface TabItem {
  color: string;
  icon: ReactNode;
  label?: string;
}

interface AnimatedTabBarProps {
  items: TabItem[];
  activeIndex: number;
  onTabChange: (index: number) => void;
}

export function AnimatedTabBar({ items, activeIndex, onTabChange }: AnimatedTabBarProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const offsetMenuBorder = useCallback(() => {
    if (!menuRef.current || !borderRef.current) return;
    const activeEl = itemRefs.current[activeIndex];
    if (!activeEl) return;
    const offsetActiveItem = activeEl.getBoundingClientRect();
    const left = Math.floor(
      offsetActiveItem.left -
        menuRef.current.offsetLeft -
        (borderRef.current.offsetWidth - offsetActiveItem.width) / 2,
    );
    borderRef.current.style.transform = `translate3d(${left}px, 0, 0)`;
  }, [activeIndex]);

  useEffect(() => {
    offsetMenuBorder();
  }, [offsetMenuBorder]);

  useEffect(() => {
    const onResize = () => {
      if (menuRef.current) {
        menuRef.current.style.removeProperty("--timeOut");
      }
      offsetMenuBorder();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [offsetMenuBorder]);

  return (
    <>
      <style>{`
        .animated-menu {
          margin: 0;
          display: flex;
          width: 100%;
          padding: 0 1.5em;
          position: relative;
          align-items: center;
          justify-content: center;
        }
        .animated-menu__item {
          all: unset;
          flex-grow: 1;
          z-index: 100;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          position: relative;
          align-items: center;
          will-change: transform;
          justify-content: center;
          gap: 0.15em;
          padding: 0.4em 0 0.65em;
          transition: transform var(--timeOut, 0.7s);
          font-family: inherit;
        }
        .animated-menu__item::before {
          content: "";
          z-index: -1;
          width: 4.4em;
          height: 4.4em;
          border-radius: 50%;
          position: absolute;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          transition: background-color 0.7s, transform 0.7s;
        }
        .animated-menu__item.active {
          transform: translate3d(0, -0.7em, 0);
        }
        .animated-menu__item.active::before {
          transform: translate(-50%, -50%) scale(1);
          background-color: var(--bgColorItem);
        }
        .animated-menu__label {
          font-size: 0.6em;
          color: #111827;
          font-weight: 500;
          line-height: 1.2;
          transition: color 0.3s;
        }
        .animated-menu__item.active .animated-menu__label {
          color: white;
        }
        .icon {
          width: 2.2em;
          height: 2.2em;
          stroke: #1f2937;
          fill: transparent;
          stroke-width: 1.8px;
          stroke-miterlimit: 10;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 400;
        }
        .animated-menu__item.active .icon {
          stroke: white;
          animation: strok 1.5s reverse;
        }
        @keyframes strok {
          100% { stroke-dashoffset: 400; }
        }
        .animated-menu__border {
          left: 0;
          bottom: 96%;
          width: 10.9em;
          height: 2.4em;
          position: absolute;
          clip-path: url(#menu);
          will-change: transform;
          transition: transform var(--timeOut, 0.7s);
          pointer-events: none;
        }
        .svg-container {
          width: 0;
          height: 0;
        }
        @media screen and (max-width: 50em) {
          .animated-menu {
            padding: 0 0.5em;
          }
          .animated-menu__item::before {
            width: 3.5em;
            height: 3.5em;
          }
          .icon {
            width: 1.8em;
            height: 1.8em;
          }
          .animated-menu__label {
            font-size: 0.55em;
          }
          .animated-menu__border {
            width: 8.5em;
            height: 2em;
          }
        }
      `}</style>

      <div className="animated-menu" ref={menuRef}>
        {items.map((item, i) => (
          <button
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={`animated-menu__item ${i === activeIndex ? "active" : ""}`}
            style={{ "--bgColorItem": item.color } as React.CSSProperties}
            onClick={() => onTabChange(i)}
          >
            {item.icon}
            {item.label && <span className="animated-menu__label">{item.label}</span>}
          </button>
        ))}
        <div className="animated-menu__border" ref={borderRef} />
      </div>

      <div className="svg-container">
        <svg viewBox="0 0 202.9 45.5">
          <clipPath
            id="menu"
            clipPathUnits="objectBoundingBox"
            transform="scale(0.0049285362247413 0.021978021978022)"
          >
            <path d="M6.7,45.5c5.7,0.1,14.1-0.4,23.3-4c5.7-2.3,9.9-5,18.1-10.5c10.7-7.1,11.8-9.2,20.6-14.3c5-2.9,9.2-5.2,15.2-7c7.1-2.1,13.3-2.3,17.6-2.1c4.2-0.2,10.5,0.1,17.6,2.1c6.1,1.8,10.2,4.1,15.2,7c8.8,5,9.9,7.1,20.6,14.3c8.3,5.5,12.4,8.2,18.1,10.5c9.2,3.6,17.6,4.2,23.3,4H6.7z" />
          </clipPath>
        </svg>
      </div>
    </>
  );
}
