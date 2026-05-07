import { usePlayground } from "@/lib/playground-context";
import { ShowcaseCard } from "@/components/ShowcaseCard";

const PATH = "M 30 180 C 90 60, 200 60, 260 180 S 430 300, 490 180 S 660 60, 720 180";

export function IlluminatedDragonShowcase() {
  const { text } = usePlayground();
  const sentence =
    (text.match(/[^.!?]+[.!?]+/g) || [text])[0]?.trim() || "Pretext.";
  const repeated = `${sentence}    \u2767    ${sentence}    \u2767    ${sentence}    \u2767    `;

  return (
    <ShowcaseCard
      title="Illuminated Dragon"
      description="A glowing comet traces the dragon's spine while text rides along its body."
      className="md:col-span-2"
    >
      <div className="relative h-[260px] bg-[#1a1410] rounded-xl overflow-hidden">
        <svg
          viewBox="0 0 750 360"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="dragonStroke" x1="0" x2="1">
              <stop offset="0%" stopColor="hsl(10, 76%, 53%)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(38, 80%, 60%)" stopOpacity="0.3" />
            </linearGradient>
            <radialGradient id="cometGlow">
              <stop offset="0%" stopColor="hsl(38, 100%, 75%)" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(10, 76%, 53%)" stopOpacity="0" />
            </radialGradient>
            <path id="dragonPath" d={PATH} />
          </defs>

          <path
            d={PATH}
            fill="none"
            stroke="url(#dragonStroke)"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <path
            d={PATH}
            fill="none"
            stroke="hsl(10, 76%, 53%)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="80 1000"
            opacity="0.9"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-1080"
              dur="5s"
              repeatCount="indefinite"
            />
          </path>

          <text
            fill="hsl(38, 100%, 92%)"
            fontFamily="Fraunces, serif"
            fontSize="14"
            letterSpacing="1.2"
          >
            <textPath href="#dragonPath" startOffset="0">
              {repeated}
            </textPath>
          </text>

          <circle r="14" fill="url(#cometGlow)">
            <animateMotion dur="5s" repeatCount="indefinite">
              <mpath href="#dragonPath" />
            </animateMotion>
          </circle>
          <circle r="3" fill="hsl(38, 100%, 88%)">
            <animateMotion dur="5s" repeatCount="indefinite">
              <mpath href="#dragonPath" />
            </animateMotion>
          </circle>
        </svg>
      </div>
    </ShowcaseCard>
  );
}
