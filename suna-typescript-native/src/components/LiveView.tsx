import React from "react";

interface LiveViewProps {
  sessionId: string;
}

const LiveView: React.FC<LiveViewProps> = ({ sessionId }) => {
  if (!sessionId) {
    return null;
  }

  return (
    <iframe
      src={`https://live.browserbase.com/session/${sessionId}`}
      width={1280}
      height={720}
      allow="clipboard-write"
    />
  );
};

export default LiveView;
