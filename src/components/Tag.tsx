import * as React from "react";

const Tag = ({
  status,
  color,
}: {
  status: string;
  color: string;
}) => {
  return (
    <div className="tag-container" style={{ backgroundColor: color }}>
      <p>{status}</p>
    </div>
  );
};

export default Tag;
