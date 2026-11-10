import visTimelineCss from "vis-timeline/styles/vis-timeline-graph2d.css";

export function attachVisTimelineStyles(doc: Document): void {
  if (doc.querySelector('style[data-chronos-vis="1"]')) return;
  const style = doc.createElement("style");
  style.setAttribute("data-chronos-vis", "1");
  style.textContent = visTimelineCss;
  doc.head.appendChild(style);
}
